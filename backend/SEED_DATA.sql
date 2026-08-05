-- LegalInsure — MSSQL schema + seed data


-- ============================================================
-- Create tables
-- ============================================================

CREATE TABLE users
(
    id NVARCHAR(50) PRIMARY KEY,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('customer', 'admin')),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    date_of_birth DATE NULL,
    id_number NVARCHAR(20) NULL,
    address NVARCHAR(255) NULL,
    joined_at DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE)
);

CREATE TABLE plans
(
    id NVARCHAR(20) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    tagline NVARCHAR(255) NULL,
    consultations_included INT NOT NULL DEFAULT 0,
    cover_limit DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE plan_features
(
    id INT IDENTITY(1, 1) PRIMARY KEY,
    plan_id NVARCHAR(20) NOT NULL,
    feature NVARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_plan_features_plans FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE cover_categories
(
    id NVARCHAR(20) PRIMARY KEY,
    label NVARCHAR(100) NOT NULL,
    description NVARCHAR(255) NULL
);

CREATE TABLE policies
(
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL UNIQUE,
    plan_id NVARCHAR(20) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active')) DEFAULT 'pending',
    start_date DATE NOT NULL,
    monthly_premium DECIMAL(10, 2) NOT NULL,
    cover_limit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cover_used DECIMAL(12, 2) NOT NULL DEFAULT 0,
    consultations_included INT NOT NULL DEFAULT 0,
    consultations_used INT NOT NULL DEFAULT 0,
    has_pre_existing_dispute BIT NOT NULL DEFAULT 0,
    pre_existing_dispute_details NVARCHAR(1000) NULL,
    personal_use_confirmed BIT NOT NULL DEFAULT 0,
    popia_consent BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_policies_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_policies_plans FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE policy_cover_categories
(
    policy_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(20) NOT NULL,
    PRIMARY KEY (policy_id, category_id),
    CONSTRAINT FK_pcc_policies FOREIGN KEY (policy_id) REFERENCES policies(id),
    CONSTRAINT FK_pcc_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id)
);

CREATE TABLE dependants
(
    id NVARCHAR(50) PRIMARY KEY,
    policy_id NVARCHAR(50) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    relationship NVARCHAR(20) NOT NULL CHECK (relationship IN ('Spouse', 'Child', 'Other')),
    CONSTRAINT FK_dependants_policies FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE TABLE claims
(
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(20) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(2000) NOT NULL,
    amount_claimed DECIMAL(12, 2) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in-review', 'approved', 'rejected')) DEFAULT 'pending',
    submitted_at DATE NOT NULL,
    decided_at DATE NULL,
    CONSTRAINT FK_claims_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_claims_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id)
);

CREATE TABLE consultations
(
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(20) NOT NULL,
    lawyer_name NVARCHAR(150) NOT NULL,
    scheduled_at DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_consultations_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_consultations_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id)
);

-- ============================================================
-- Seed reference/lookup data
-- ============================================================

INSERT INTO plans
    (id, name, monthly_price, tagline, consultations_included, cover_limit)
VALUES
    ('basic', 'Basic', 99, 'Everyday legal guidance, always on', 0, 0),
    ('premium', 'Premium', 199, 'Real lawyer access when it matters', 2, 0),
    ('ultimate', 'Ultimate', 399, 'Full legal expense cover and representation', -1, 500000);

INSERT INTO plan_features
    (plan_id, feature, sort_order)
VALUES
    ('basic', '24/7 AI legal guidance assistant', 1),
    ('basic', 'Legal document templates', 2),
    ('basic', 'Email support within 24 hours', 3),
    ('premium', 'Everything in Basic', 1),
    ('premium', '2 lawyer consultations per month', 2),
    ('premium', 'Contract review by a qualified attorney', 3),
    ('premium', 'Priority response within 4 hours', 4),
    ('ultimate', 'Everything in Premium', 1),
    ('ultimate', 'Unlimited lawyer consultations', 2),
    ('ultimate', 'Legal expense cover up to R500,000', 3),
    ('ultimate', 'Court representation support', 4);

INSERT INTO cover_categories
    (id, label, description)
VALUES
    ('labour', 'Labour Disputes', 'Unfair dismissal, unpaid wages, and CCMA referrals.'),
    ('consumer', 'Consumer Claims', 'Disputes with retailers, service providers, and suppliers.'),
    ('civil', 'Civil Litigation', 'General civil claims and defended court proceedings.'),
    ('property', 'Property Disputes', 'Landlord/tenant, boundary, and body corporate disputes.'),
    ('estate', 'Estate & Wills', 'Will drafting, estate administration, and disputes.'),
    ('contract', 'Contract Review', 'Drafting and reviewing contracts before you sign.');

-- ============================================================
-- Seed users
-- Demo passwords: customers = "Password1", admins = "Admin123"
-- (hashed with werkzeug.security.generate_password_hash — scrypt)
-- ============================================================

INSERT INTO users
    (id, role, first_name, last_name, email, password_hash, phone, date_of_birth, id_number, address, joined_at)
VALUES
    ('u1', 'customer', 'Thandeka', 'Mokoena', 'thandeka@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '081 234 5678', '1990-04-22', '9004225800089', '12 Vilakazi Street, Soweto, Johannesburg', '2025-03-12'),
    ('u2', 'customer', 'Johan', 'van der Merwe', 'johan@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '082 345 6789', '1985-11-03', '8511035012088', '45 Kerk Street, Stellenbosch', '2025-05-02'),
    ('u3', 'customer', 'Naledi', 'Khumalo', 'naledi@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '083 456 7890', '1993-07-15', '9307155300085', '8 Long Street, Cape Town', '2025-06-18'),
    ('u4', 'customer', 'Sipho', 'Dube', 'sipho@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '084 567 8901', '1998-02-27', '9802275900082', '23 Florida Road, Durban', '2025-09-01'),
    ('u5', 'customer', 'Amanda', 'Botha', 'amanda@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '071 678 9012', '1988-09-10', '8809105800081', '5 Voortrekker Road, Bellville', '2025-11-20'),
    ('u6', 'customer', 'Kagiso', 'Sithole', 'kagiso@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '072 789 0123', '1991-12-05', '9112055400086', '17 Jan Smuts Avenue, Johannesburg', '2026-01-14'),
    ('admin1', 'admin', 'Lindiwe', 'Dlamini', 'admin@legalinsure.co.za',
        'scrypt:32768:8:1$M1lKvPP83FaPpzg9$1651dfcfa1cbf71cc75a5a85f30b7d347cbec50835dc900e99052c7755a589eb3720b18fa822b975ed648c4830e31e7a3642d293b70d5d8c6f18c473cdebf51b',
        '010 555 0100', '1987-06-18', '8706185300084', '1 Sanlam Office Park, Bellville', '2024-01-01'),
    ('admin2', 'admin', 'Pieter', 'Nel', 'pieter.nel@legalinsure.co.za',
        'scrypt:32768:8:1$M1lKvPP83FaPpzg9$1651dfcfa1cbf71cc75a5a85f30b7d347cbec50835dc900e99052c7755a589eb3720b18fa822b975ed648c4830e31e7a3642d293b70d5d8c6f18c473cdebf51b',
        '010 555 0101', '1990-01-30', '9001305100083', '1 Sanlam Office Park, Bellville', '2024-02-15');

-- ============================================================
-- Seed policies (all pre-existing demo accounts are already "active" —
-- the "pending" status only ever applies to brand-new signups)
-- ============================================================

INSERT INTO policies
    (id, user_id, plan_id, status, start_date, monthly_premium, cover_limit, cover_used, consultations_included, consultations_used, has_pre_existing_dispute, personal_use_confirmed, popia_consent)
VALUES
    ('p1', 'u1', 'premium', 'active', '2025-03-12', 199, 0, 0, 2, 1, 0, 1, 1),
    ('p2', 'u2', 'basic', 'active', '2025-05-02', 99, 0, 0, 0, 0, 0, 1, 1),
    ('p3', 'u3', 'ultimate', 'active', '2025-06-18', 399, 500000, 45000, -1, 4, 0, 1, 1),
    ('p4', 'u4', 'basic', 'active', '2025-09-01', 99, 0, 0, 0, 0, 0, 1, 1),
    ('p5', 'u5', 'premium', 'active', '2025-11-20', 199, 0, 0, 2, 0, 0, 1, 1),
    ('p6', 'u6', 'ultimate', 'active', '2026-01-14', 399, 500000, 120000, -1, 2, 0, 1, 1);

INSERT INTO policy_cover_categories
    (policy_id, category_id)
VALUES
    ('p1', 'labour'),
    ('p1', 'consumer'),
    ('p1', 'contract'),
    ('p2', 'consumer'),
    ('p2', 'contract'),
    ('p3', 'labour'),
    ('p3', 'consumer'),
    ('p3', 'civil'),
    ('p3', 'property'),
    ('p3', 'estate'),
    ('p3', 'contract'),
    ('p4', 'consumer'),
    ('p4', 'contract'),
    ('p5', 'labour'),
    ('p5', 'consumer'),
    ('p5', 'contract'),
    ('p6', 'labour'),
    ('p6', 'consumer'),
    ('p6', 'civil'),
    ('p6', 'property'),
    ('p6', 'estate'),
    ('p6', 'contract');

-- A couple of example dependants, to prove the table/relationship out —
-- the frontend mock data doesn't have any yet since the feature is new.
INSERT INTO dependants
    (id, policy_id, name, date_of_birth, relationship)
VALUES
    ('d1', 'p3', 'Thabo Khumalo', '2015-03-10', 'Child'),
    ('d2', 'p6', 'Zanele Sithole', '1992-08-22', 'Spouse');

-- ============================================================
-- Seed claims
-- ============================================================

INSERT INTO claims
    (id, user_id, category_id, title, description, amount_claimed, status, submitted_at, decided_at)
VALUES
    ('c1', 'u1', 'labour', 'Unfair dismissal dispute', 'Dismissed without a disciplinary hearing after 3 years of service.', 15000, 'pending', '2026-06-01', NULL),
    ('c2', 'u3', 'property', 'Boundary wall dispute with neighbour', 'Neighbour built a wall 40cm over the property boundary line.', 32000, 'in-review', '2026-05-20', NULL),
    ('c3', 'u3', 'civil', 'Breach of service agreement', 'Contractor failed to deliver renovation work as agreed.', 68000, 'approved', '2026-04-11', '2026-04-18'),
    ('c4', 'u5', 'consumer', 'Faulty appliance refund refusal', 'Retailer refuses to refund a defective appliance under the CPA.', 8500, 'rejected', '2026-03-02', '2026-03-09'),
    ('c5', 'u6', 'estate', 'Estate administration dispute', 'Disagreement over the distribution of a deceased estate.', 120000, 'pending', '2026-06-28', NULL),
    ('c6', 'u6', 'labour', 'Unpaid overtime claim', 'Employer has not paid overtime accrued over 6 months.', 22000, 'approved', '2026-02-14', '2026-02-20');

-- ============================================================
-- Seed consultations
-- ============================================================

INSERT INTO consultations
    (id, user_id, category_id, lawyer_name, scheduled_at, status, notes)
VALUES
    ('k1', 'u1', 'contract', 'Adv. Kabelo Ntuli', '2026-07-22T10:00:00', 'scheduled', 'Review of a new employment contract clause.'),
    ('k2', 'u3', 'property', 'Adv. Refilwe Maseko', '2026-06-10T14:00:00', 'completed', 'Discussed boundary dispute options.'),
    ('k3', 'u5', 'labour', 'Adv. Kabelo Ntuli', '2026-05-05T09:00:00', 'completed', 'Advice on a workplace grievance procedure.'),
    ('k4', 'u6', 'estate', 'Adv. Zanele Cele', '2026-07-30T11:30:00', 'scheduled', 'Estate distribution consultation.');
