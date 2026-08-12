-- LegalInsure - migration for everything added on top of an already-running
-- database this session: claim evidence documents, employment/marital
-- status, banking details, legal history, next of kin.
--
-- Every block below is guarded (IF COL_LENGTH / IF OBJECT_ID / IF NOT
-- EXISTS), so this script is safe to run against your existing DB
-- regardless of which of these changes you already have - and safe to
-- re-run if you're not sure whether it already applied.
--
-- Each block is separated by GO. This isn't optional formatting - SQL
-- Server compiles a whole batch (everything between GO markers) before
-- running any of it, so a constraint referencing a column added earlier
-- in the *same* batch fails to resolve even though the ADD runs first.
-- GO forces each block to fully execute before the next one is compiled.
--
-- If you're setting up a brand-new database instead, just run the current
-- SEED_DATA.sql - it already includes all of this and you don't need this
-- file at all.

-- ============================================================
-- claim_documents (evidence attached to a claim)
-- ============================================================

IF OBJECT_ID('claim_documents', 'U') IS NULL
BEGIN
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
END
GO

-- ============================================================
-- users - employment + marital status
-- ============================================================

IF COL_LENGTH('users', 'employer_name') IS NULL
BEGIN
    ALTER TABLE users ADD
        employer_name NVARCHAR(150) NULL,
        occupation NVARCHAR(100) NULL,
        employment_status NVARCHAR(20) NULL,
        marital_status NVARCHAR(20) NULL;
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.check_constraints
WHERE name = 'CK_users_employment_status')
BEGIN
    ALTER TABLE users ADD CONSTRAINT CK_users_employment_status
        CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'retired', 'student'));
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.check_constraints
WHERE name = 'CK_users_marital_status')
BEGIN
    ALTER TABLE users ADD CONSTRAINT CK_users_marital_status
        CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed'));
END
GO

-- ============================================================
-- policies - premium collection / banking details
-- ============================================================

IF COL_LENGTH('policies', 'payment_method') IS NULL
BEGIN
    ALTER TABLE policies ADD
        payment_method NVARCHAR(20) NULL,
        bank_name NVARCHAR(100) NULL,
        account_holder NVARCHAR(150) NULL,
        account_number NVARCHAR(30) NULL,
        branch_code NVARCHAR(10) NULL;
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.check_constraints
WHERE name = 'CK_policies_payment_method')
BEGIN
    ALTER TABLE policies ADD CONSTRAINT CK_policies_payment_method
        CHECK (payment_method IN ('debit_order', 'eft', 'card'));
END
GO

-- ============================================================
-- New tables - legal history + next of kin
-- ============================================================

IF OBJECT_ID('legal_history_entries', 'U') IS NULL
BEGIN
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
END
GO

IF OBJECT_ID('next_of_kin', 'U') IS NULL
BEGIN
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
END
GO

-- ============================================================
-- Backfill the same demo values SEED_DATA.sql seeds on a fresh DB, so
-- existing demo accounts (u1/u2/u3, p1/p3) show populated data too.
-- UPDATEs are naturally idempotent; INSERTs are guarded so this whole
-- script can be re-run safely.
-- ============================================================

UPDATE users SET employer_name = 'Metro Retail Group', occupation = 'Store Manager', employment_status = 'employed', marital_status = 'married' WHERE id = 'u1';
UPDATE users SET employer_name = 'Self-employed - Van der Merwe Consulting', occupation = 'Business Consultant', employment_status = 'self-employed', marital_status = 'married' WHERE id = 'u2';
UPDATE users SET employer_name = 'Western Cape Health Dept', occupation = 'Registered Nurse', employment_status = 'employed', marital_status = 'single' WHERE id = 'u3';

UPDATE policies SET payment_method = 'debit_order', bank_name = 'Standard Bank', account_holder = 'Thandeka Mokoena', account_number = '0123456789', branch_code = '051001' WHERE id = 'p1';
UPDATE policies SET payment_method = 'debit_order', bank_name = 'Capitec Bank', account_holder = 'Naledi Khumalo', account_number = '9988776655', branch_code = '470010' WHERE id = 'p3';
GO

IF NOT EXISTS (SELECT 1
FROM legal_history_entries
WHERE id = 'lh1')
BEGIN
    INSERT INTO legal_history_entries
        (id, user_id, category_id, description, occurred_at, was_insured_claim, other_insurer, disclosed_at)
    VALUES
        ('lh1', 'u3', 'property', 'Prior boundary dispute with a different neighbour, resolved via mediation.', '2023-08-01', 0, NULL, '2025-06-18'),
        ('lh2', 'u6', 'labour', 'CCMA referral against a previous employer for unpaid leave, settled out of hearing.', '2024-02-10', 1, 'Old Mutual Legal Cover', '2026-01-14');
END
GO

IF NOT EXISTS (SELECT 1
FROM next_of_kin
WHERE id = 'nk1')
BEGIN
    INSERT INTO next_of_kin
        (id, user_id, name, relationship, phone, email)
    VALUES
        ('nk1', 'u1', 'Nomvula Mokoena', 'Mother', '083 111 2233', 'nomvula.mokoena@example.com'),
        ('nk2', 'u3', 'Sipho Khumalo', 'Brother', '082 444 5566', NULL);
END
GO
