-- LegalInsure - MSSQL schema + seed data


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
    joined_at DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE)
);

-- 1:1 with users - underwriting/personal-details profile, split out to keep
-- the core identity table lean (see backend/models/user_profile.py).
CREATE TABLE user_profiles
(
    user_id NVARCHAR(50) PRIMARY KEY,
    date_of_birth DATE NULL,
    id_number NVARCHAR(20) NULL,
    address NVARCHAR(255) NULL,
    -- Employment (needed to sensibly underwrite/verify Labour Dispute claims)
    employer_name NVARCHAR(150) NULL,
    occupation NVARCHAR(100) NULL,
    employment_status NVARCHAR(20) NULL
        CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'retired', 'student')),
    marital_status NVARCHAR(20) NULL
        CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    CONSTRAINT FK_user_profiles_users FOREIGN KEY (user_id) REFERENCES users(id)
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
    CONSTRAINT FK_policies_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_policies_plans FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- 1:1 with policies - underwriting disclosures/consent captured during
-- Build Policy, split out from the operational policy record (see
-- backend/models/policy_disclosure.py).
CREATE TABLE policy_disclosures
(
    policy_id NVARCHAR(50) PRIMARY KEY,
    has_pre_existing_dispute BIT NOT NULL DEFAULT 0,
    pre_existing_dispute_details NVARCHAR(1000) NULL,
    personal_use_confirmed BIT NOT NULL DEFAULT 0,
    popia_consent BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_policy_disclosures_policies FOREIGN KEY (policy_id) REFERENCES policies(id)
);

-- 1:1 with policies - premium collection details, split out as the most
-- sensitive fields on the policy record (see backend/models/policy_banking.py).
-- account_number is stored in full here but the API only ever returns
-- a masked version (see policies_bp.serialize_policy); there's no
-- endpoint that echoes the raw value back once it's set.
CREATE TABLE policy_banking
(
    policy_id NVARCHAR(50) PRIMARY KEY,
    payment_method NVARCHAR(20) NULL CHECK (payment_method IN ('debit_order', 'eft', 'card')),
    bank_name NVARCHAR(100) NULL,
    account_holder NVARCHAR(150) NULL,
    account_number NVARCHAR(30) NULL,
    branch_code NVARCHAR(10) NULL,
    CONSTRAINT FK_policy_banking_policies FOREIGN KEY (policy_id) REFERENCES policies(id)
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

-- The panel of law firms and individual practitioners LegalInsure actually
-- works with. Required by the spec as a first-class "Partners" entity and
-- never implemented - consultations used to store a free-text lawyer_name
-- with no real attorney behind it. This is also who claim/consultation
-- money actually goes to, since it never reaches the client directly.
CREATE TABLE law_firms
(
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    registration_number NVARCHAR(50) NULL,
    bio NVARCHAR(1000) NULL,
    phone NVARCHAR(20) NULL,
    email NVARCHAR(255) NULL,
    address NVARCHAR(255) NULL,
    is_active BIT NOT NULL DEFAULT 1
);

CREATE TABLE practitioners
(
    id NVARCHAR(50) PRIMARY KEY,
    firm_id NVARCHAR(50) NOT NULL,
    name NVARCHAR(150) NOT NULL,
    title NVARCHAR(50) NULL,
    practice_number NVARCHAR(50) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(20) NULL,
    bio NVARCHAR(1000) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_practitioners_firms FOREIGN KEY (firm_id) REFERENCES law_firms(id)
);

CREATE TABLE practitioner_categories
(
    practitioner_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(20) NOT NULL,
    PRIMARY KEY (practitioner_id, category_id),
    CONSTRAINT FK_pracat_practitioners FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
    CONSTRAINT FK_pracat_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id)
);

CREATE TABLE consultations
(
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(20) NOT NULL,
    practitioner_id NVARCHAR(50) NULL,
    lawyer_name NVARCHAR(150) NOT NULL,
    scheduled_at DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes NVARCHAR(1000) NULL,
    CONSTRAINT FK_consultations_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_consultations_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id),
    CONSTRAINT FK_consultations_practitioners FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);

-- Supporting evidence attached to a claim (CCMA referrals, photos, letters,
-- quotes, etc.). Required by the data model spec but never implemented -
-- the file itself lives on disk under UPLOAD_FOLDER; this row is metadata.
CREATE TABLE claim_documents
(
    id NVARCHAR(50) PRIMARY KEY,
    claim_id NVARCHAR(50) NOT NULL,
    uploaded_by NVARCHAR(50) NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    stored_path NVARCHAR(500) NOT NULL,
    content_type NVARCHAR(100) NULL,
    file_size INT NOT NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_claim_documents_claims FOREIGN KEY (claim_id) REFERENCES claims(id),
    CONSTRAINT FK_claim_documents_users FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Client's disclosed legal history - belongs to the person, not a single
-- policy, since it's underwriting/fraud-risk context that should follow
-- them across renewals. Distinct from policies.has_pre_existing_dispute,
-- which is just the coarse yes/no gate asked once at policy build time.
CREATE TABLE legal_history_entries
(
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(20) NULL,
    description NVARCHAR(1000) NOT NULL,
    occurred_at DATE NULL,
    was_insured_claim BIT NOT NULL DEFAULT 0,
    other_insurer NVARCHAR(150) NULL,
    disclosed_at DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    CONSTRAINT FK_legal_history_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_legal_history_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id)
);

-- Emergency/beneficiary contact - separate from dependants, which is
-- specifically about who is covered under the policy, not who to contact.
CREATE TABLE next_of_kin
(
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    name NVARCHAR(150) NOT NULL,
    relationship NVARCHAR(50) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(255) NULL,
    CONSTRAINT FK_next_of_kin_users FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Catalog of tangible, usage-limited perks bundled into cover (distinct
-- from plan_features, which is just marketing copy with no usage tracking).
-- Applies uniformly across plans for now - not gated by plan tier.
CREATE TABLE benefits
(
    id NVARCHAR(20) PRIMARY KEY,
    label NVARCHAR(150) NOT NULL,
    description NVARCHAR(1000) NOT NULL,
    usage_limit_count INT NULL,
    usage_limit_amount DECIMAL(10, 2) NULL,
    period NVARCHAR(20) NOT NULL DEFAULT 'annual'
);

-- Actual usage of a benefit against a specific policy.
CREATE TABLE policy_benefits
(
    policy_id NVARCHAR(50) NOT NULL,
    benefit_id NVARCHAR(20) NOT NULL,
    used_count INT NOT NULL DEFAULT 0,
    used_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    PRIMARY KEY (policy_id, benefit_id),
    CONSTRAINT FK_policy_benefits_policies FOREIGN KEY (policy_id) REFERENCES policies(id),
    CONSTRAINT FK_policy_benefits_benefits FOREIGN KEY (benefit_id) REFERENCES benefits(id)
);

-- ============================================================
-- Seed reference/lookup data
-- ============================================================

INSERT INTO plans
    (id, name, monthly_price, tagline, consultations_included, cover_limit)
VALUES
    ('basic', 'Basic', 99, 'Everyday legal guidance, always on', 0, 100000),
    ('premium', 'Premium', 199, 'Real lawyer access when it matters', 2, 250000),
    ('ultimate', 'Ultimate', 399, 'Full legal expense cover and representation', -1, 500000);

INSERT INTO plan_features
    (plan_id, feature, sort_order)
VALUES
    ('basic', '24/7 AI legal guidance assistant', 1),
    ('basic', 'Legal document templates', 2),
    ('basic', 'Legal expense cover up to R100,000', 3),
    ('basic', 'Email support within 24 hours', 4),
    ('premium', 'Everything in Basic', 1),
    ('premium', '2 lawyer consultations per month', 2),
    ('premium', 'Contract review by a qualified attorney', 3),
    ('premium', 'Legal expense cover up to R250,000', 4),
    ('premium', 'Priority response within 4 hours', 5),
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
-- (hashed with werkzeug.security.generate_password_hash - scrypt)
-- ============================================================

INSERT INTO users
    (id, role, first_name, last_name, email, password_hash, phone, joined_at)
VALUES
    ('u1', 'customer', 'Thandeka', 'Mokoena', 'thandeka@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '081 234 5678', '2025-03-12'),
    ('u2', 'customer', 'Johan', 'van der Merwe', 'johan@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '082 345 6789', '2025-05-02'),
    ('u3', 'customer', 'Naledi', 'Khumalo', 'naledi@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '083 456 7890', '2025-06-18'),
    ('u4', 'customer', 'Sipho', 'Dube', 'sipho@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '084 567 8901', '2025-09-01'),
    ('u5', 'customer', 'Amanda', 'Botha', 'amanda@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '071 678 9012', '2025-11-20'),
    ('u6', 'customer', 'Kagiso', 'Sithole', 'kagiso@example.com',
        'scrypt:32768:8:1$ND4rUOUfOG5efmfz$98d0d0f9d4e8af61f5940861aaa7736de4861689e1d2788611e7fd6638a6e0a6f5f817dc58fde79ccf6d2c417e5bfe77996531a28457abe8c0f96d9a78e2dbb4',
        '072 789 0123', '2026-01-14'),
    ('admin1', 'admin', 'Lindiwe', 'Dlamini', 'admin@legalinsure.co.za',
        'scrypt:32768:8:1$M1lKvPP83FaPpzg9$1651dfcfa1cbf71cc75a5a85f30b7d347cbec50835dc900e99052c7755a589eb3720b18fa822b975ed648c4830e31e7a3642d293b70d5d8c6f18c473cdebf51b',
        '010 555 0100', '2024-01-01'),
    ('admin2', 'admin', 'Pieter', 'Nel', 'pieter.nel@legalinsure.co.za',
        'scrypt:32768:8:1$M1lKvPP83FaPpzg9$1651dfcfa1cbf71cc75a5a85f30b7d347cbec50835dc900e99052c7755a589eb3720b18fa822b975ed648c4830e31e7a3642d293b70d5d8c6f18c473cdebf51b',
        '010 555 0101', '2024-02-15');

INSERT INTO user_profiles
    (user_id, date_of_birth, id_number, address)
VALUES
    ('u1', '1990-04-22', '9004225800089', '12 Vilakazi Street, Soweto, Johannesburg'),
    ('u2', '1985-11-03', '8511035012088', '45 Kerk Street, Stellenbosch'),
    ('u3', '1993-07-15', '9307155300085', '8 Long Street, Cape Town'),
    ('u4', '1998-02-27', '9802275900082', '23 Florida Road, Durban'),
    ('u5', '1988-09-10', '8809105800081', '5 Voortrekker Road, Bellville'),
    ('u6', '1991-12-05', '9112055400086', '17 Jan Smuts Avenue, Johannesburg'),
    ('admin1', '1987-06-18', '8706185300084', '1 Sanlam Office Park, Bellville'),
    ('admin2', '1990-01-30', '9001305100083', '1 Sanlam Office Park, Bellville');

-- A few demo accounts filled in with employment/marital details, to prove
-- the columns out - not every seeded user needs one for the demo to work.
UPDATE user_profiles SET employer_name = 'Metro Retail Group', occupation = 'Store Manager', employment_status = 'employed', marital_status = 'married' WHERE user_id = 'u1';
UPDATE user_profiles SET employer_name = 'Self-employed - Van der Merwe Consulting', occupation = 'Business Consultant', employment_status = 'self-employed', marital_status = 'married' WHERE user_id = 'u2';
UPDATE user_profiles SET employer_name = 'Western Cape Health Dept', occupation = 'Registered Nurse', employment_status = 'employed', marital_status = 'single' WHERE user_id = 'u3';

-- ============================================================
-- Seed policies (all pre-existing demo accounts are already "active" -
-- the "pending" status only ever applies to brand-new signups)
-- ============================================================

INSERT INTO policies
    (id, user_id, plan_id, status, start_date, monthly_premium, cover_limit, cover_used, consultations_included, consultations_used)
VALUES
    ('p1', 'u1', 'premium', 'active', '2025-03-12', 199, 0, 0, 2, 1),
    ('p2', 'u2', 'basic', 'active', '2025-05-02', 99, 0, 0, 0, 0),
    ('p3', 'u3', 'ultimate', 'active', '2025-06-18', 399, 500000, 45000, -1, 4),
    ('p4', 'u4', 'basic', 'active', '2025-09-01', 99, 0, 0, 0, 0),
    ('p5', 'u5', 'premium', 'active', '2025-11-20', 199, 0, 0, 2, 0),
    ('p6', 'u6', 'ultimate', 'active', '2026-01-14', 399, 500000, 120000, -1, 2);

INSERT INTO policy_disclosures
    (policy_id, has_pre_existing_dispute, personal_use_confirmed, popia_consent)
VALUES
    ('p1', 0, 1, 1),
    ('p2', 0, 1, 1),
    ('p3', 0, 1, 1),
    ('p4', 0, 1, 1),
    ('p5', 0, 1, 1),
    ('p6', 0, 1, 1);

-- Demo debit order details on a couple of policies, to prove the columns
-- out. account_number is a genuine value here only because this is seed
-- data for a local demo DB - the API never returns it in full (see
-- policies_bp.serialize_policy, which only exposes accountNumberMasked).
INSERT INTO policy_banking
    (policy_id, payment_method, bank_name, account_holder, account_number, branch_code)
VALUES
    ('p1', 'debit_order', 'Standard Bank', 'Thandeka Mokoena', '0123456789', '051001'),
    ('p3', 'debit_order', 'Capitec Bank', 'Naledi Khumalo', '9988776655', '470010');

-- ============================================================
-- Seed benefits catalog + demo usage per policy
-- ============================================================

INSERT INTO benefits
    (id, label, description, usage_limit_count, usage_limit_amount, period)
VALUES
    ('will-estate', 'Free Will & Estate Documenting',
        'Have your last will and testament professionally drafted at no extra cost, plus guidance on structuring your estate. One drafting session included per year.',
        1, NULL, 'annual'),
    ('traffic-fines', 'Traffic Fine Cover',
        'We''ll cover up to 2 eligible traffic fines per year, up to a combined total of R1,000, including help disputing incorrectly issued fines.',
        2, 1000, 'annual'),
    ('pre-claim-consult', 'Free Pre-Claim Consultation',
        'Not sure if you have a case? Speak to one of our panel attorneys before you submit a claim, at no cost and with no obligation to proceed.',
        1, NULL, 'annual'),
    ('identity-theft', 'Identity Theft & Fraud Assistance',
        'If your ID document, bank card, or SIM is compromised, we''ll connect you with an attorney to help you act fast - affidavits, bank disputes, and reporting guidance included. One case per year.',
        1, NULL, 'annual');

-- Every active policy gets a usage row per benefit, with varied demo state
-- (unused / partially used / fully used) so the dashboard isn't just a
-- wall of "Available" chips.
INSERT INTO policy_benefits
    (policy_id, benefit_id, used_count, used_amount)
VALUES
    ('p1', 'will-estate', 0, 0),
    ('p1', 'traffic-fines', 1, 350),
    ('p1', 'pre-claim-consult', 1, 0),
    ('p1', 'identity-theft', 0, 0),
    ('p2', 'will-estate', 0, 0),
    ('p2', 'traffic-fines', 0, 0),
    ('p2', 'pre-claim-consult', 0, 0),
    ('p2', 'identity-theft', 0, 0),
    ('p3', 'will-estate', 1, 0),
    ('p3', 'traffic-fines', 2, 1000),
    ('p3', 'pre-claim-consult', 1, 0),
    ('p3', 'identity-theft', 0, 0),
    ('p4', 'will-estate', 0, 0),
    ('p4', 'traffic-fines', 0, 0),
    ('p4', 'pre-claim-consult', 0, 0),
    ('p4', 'identity-theft', 0, 0),
    ('p5', 'will-estate', 0, 0),
    ('p5', 'traffic-fines', 1, 420),
    ('p5', 'pre-claim-consult', 0, 0),
    ('p5', 'identity-theft', 0, 0),
    ('p6', 'will-estate', 1, 0),
    ('p6', 'traffic-fines', 0, 0),
    ('p6', 'pre-claim-consult', 0, 0),
    ('p6', 'identity-theft', 0, 0);

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

-- A couple of example dependants, to prove the table/relationship out -
-- the frontend mock data doesn't have any yet since the feature is new.
INSERT INTO dependants
    (id, policy_id, name, date_of_birth, relationship)
VALUES
    ('d1', 'p3', 'Thabo Khumalo', '2015-03-10', 'Child'),
    ('d2', 'p6', 'Zanele Sithole', '1992-08-22', 'Spouse');

-- A couple of example legal-history disclosures and next-of-kin contacts,
-- to prove the tables/relationships out.
INSERT INTO legal_history_entries
    (id, user_id, category_id, description, occurred_at, was_insured_claim, other_insurer, disclosed_at)
VALUES
    ('lh1', 'u3', 'property', 'Prior boundary dispute with a different neighbour, resolved via mediation.', '2023-08-01', 0, NULL, '2025-06-18'),
    ('lh2', 'u6', 'labour', 'CCMA referral against a previous employer for unpaid leave, settled out of hearing.', '2024-02-10', 1, 'Old Mutual Legal Cover', '2026-01-14');

INSERT INTO next_of_kin
    (id, user_id, name, relationship, phone, email)
VALUES
    ('nk1', 'u1', 'Nomvula Mokoena', 'Mother', '083 111 2233', 'nomvula.mokoena@example.com'),
    ('nk2', 'u3', 'Sipho Khumalo', 'Brother', '082 444 5566', NULL);

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
-- Seed the panel - law firms, practitioners, and their specializations
-- ============================================================

INSERT INTO law_firms
    (id, name, registration_number, bio, phone, email, address)
VALUES
    ('f1', 'Ntuli & Associates Attorneys', 'LPC/2014/00812',
        'A Johannesburg-based labour and commercial law practice with over a decade representing employees in CCMA and Labour Court matters.',
        '011 622 4410', 'contact@ntuliattorneys.co.za', '4th Floor, Sandton Legal Chambers, Johannesburg'),
    ('f2', 'Maseko Ndlovu Inc.', 'LPC/2011/00459',
        'A Cape Town property and consumer law firm known for practical, fast-turnaround dispute resolution outside of court where possible.',
        '021 447 2290', 'info@masekondlovu.co.za', '12 Long Street, Cape Town'),
    ('f3', 'Cele Legal Chambers', 'LPC/2017/01123',
        'A boutique estates and civil litigation practice serving Durban and the greater KwaZulu-Natal region.',
        '031 566 8801', 'reception@celelegal.co.za', '88 Florida Road, Durban');

INSERT INTO practitioners
    (id, firm_id, name, title, practice_number, email, phone, bio)
VALUES
    ('pr1', 'f1', 'Kabelo Ntuli', 'Adv.', 'LP0084213', 'kabelo@ntuliattorneys.co.za', '082 001 1122',
        'Founding director specializing in unfair dismissal and CCMA referrals, with 12 years at the Johannesburg Labour Court.'),
    ('pr2', 'f1', 'Naledi Sithole', 'Attorney', 'LP0091847', 'naledi@ntuliattorneys.co.za', '082 001 1133',
        'Handles wage disputes and consumer complaints, with a focus on retail and hospitality sector employees.'),
    ('pr3', 'f2', 'Refilwe Maseko', 'Adv.', 'LP0077321', 'refilwe@masekondlovu.co.za', '083 002 2244',
        'Specializes in landlord/tenant and boundary disputes, and estate cover for property-related matters.'),
    ('pr4', 'f2', 'Thabo Radebe', 'Attorney', 'LP0088562', 'thabo@masekondlovu.co.za', '083 002 2255',
        'Civil litigation attorney handling defended court proceedings and contested property claims.'),
    ('pr5', 'f3', 'Zanele Cele', 'Adv.', 'LP0065934', 'zanele@celelegal.co.za', '084 003 3366',
        'Estate administration and will disputes, with additional experience in contract review.'),
    ('pr6', 'f3', 'Palesa Mahlangu', 'Attorney', 'LP0093410', 'palesa@celelegal.co.za', '084 003 3377',
        'Handles labour disputes and estate matters for clients across KwaZulu-Natal.');

INSERT INTO practitioner_categories
    (practitioner_id, category_id)
VALUES
    ('pr1', 'labour'), ('pr1', 'contract'), ('pr1', 'civil'),
    ('pr2', 'consumer'), ('pr2', 'labour'),
    ('pr3', 'property'), ('pr3', 'consumer'), ('pr3', 'estate'),
    ('pr4', 'civil'), ('pr4', 'property'),
    ('pr5', 'estate'), ('pr5', 'civil'), ('pr5', 'contract'),
    ('pr6', 'labour'), ('pr6', 'estate');

-- ============================================================
-- Seed consultations
-- ============================================================

INSERT INTO consultations
    (id, user_id, category_id, practitioner_id, lawyer_name, scheduled_at, status, notes)
VALUES
    ('k1', 'u1', 'contract', 'pr1', 'Adv. Kabelo Ntuli', '2026-07-22T10:00:00', 'scheduled', 'Review of a new employment contract clause.'),
    ('k2', 'u3', 'property', 'pr3', 'Adv. Refilwe Maseko', '2026-06-10T14:00:00', 'completed', 'Discussed boundary dispute options.'),
    ('k3', 'u5', 'labour', 'pr1', 'Adv. Kabelo Ntuli', '2026-05-05T09:00:00', 'completed', 'Advice on a workplace grievance procedure.'),
    ('k4', 'u6', 'estate', 'pr5', 'Adv. Zanele Cele', '2026-07-30T11:30:00', 'scheduled', 'Estate distribution consultation.');
