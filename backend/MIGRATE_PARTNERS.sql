-- LegalInsure - migration adding the law firm / practitioner panel to an
-- already-running database (law_firms, practitioners, practitioner_categories,
-- and consultations.practitioner_id).
--

-- ============================================================
-- New tables - law firms, practitioners, their specializations
-- ============================================================

IF OBJECT_ID('law_firms', 'U') IS NULL
BEGIN
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
END
GO

IF OBJECT_ID('practitioners', 'U') IS NULL
BEGIN
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
END
GO

IF OBJECT_ID('practitioner_categories', 'U') IS NULL
BEGIN
    CREATE TABLE practitioner_categories
    (
        practitioner_id NVARCHAR(50) NOT NULL,
        category_id NVARCHAR(20) NOT NULL,
        PRIMARY KEY (practitioner_id, category_id),
        CONSTRAINT FK_pracat_practitioners FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
        CONSTRAINT FK_pracat_categories FOREIGN KEY (category_id) REFERENCES cover_categories(id)
    );
END
GO

-- ============================================================
-- consultations - link each booking to a real practitioner
-- ============================================================

IF COL_LENGTH('consultations', 'practitioner_id') IS NULL
BEGIN
    ALTER TABLE consultations ADD practitioner_id NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.foreign_keys
WHERE name = 'FK_consultations_practitioners')
BEGIN
    ALTER TABLE consultations ADD CONSTRAINT FK_consultations_practitioners
        FOREIGN KEY (practitioner_id) REFERENCES practitioners(id);
END
GO

-- ============================================================
-- Seed the panel
-- ============================================================

IF NOT EXISTS (SELECT 1
FROM law_firms
WHERE id = 'f1')
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1
FROM practitioners
WHERE id = 'pr1')
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1
FROM practitioner_categories
WHERE practitioner_id = 'pr1' AND category_id = 'labour')
BEGIN
    INSERT INTO practitioner_categories
        (practitioner_id, category_id)
    VALUES
        ('pr1', 'labour'),
        ('pr1', 'contract'),
        ('pr1', 'civil'),
        ('pr2', 'consumer'),
        ('pr2', 'labour'),
        ('pr3', 'property'),
        ('pr3', 'consumer'),
        ('pr3', 'estate'),
        ('pr4', 'civil'),
        ('pr4', 'property'),
        ('pr5', 'estate'),
        ('pr5', 'civil'),
        ('pr5', 'contract'),
        ('pr6', 'labour'),
        ('pr6', 'estate');
END
GO

-- Backfill the existing seeded consultations (k1-k4) so they point at a
-- real practitioner instead of just a free-text name. Idempotent - safe
-- to re-run.
UPDATE consultations SET practitioner_id = 'pr1' WHERE id = 'k1';
UPDATE consultations SET practitioner_id = 'pr3' WHERE id = 'k2';
UPDATE consultations SET practitioner_id = 'pr1' WHERE id = 'k3';
UPDATE consultations SET practitioner_id = 'pr5' WHERE id = 'k4';
GO
