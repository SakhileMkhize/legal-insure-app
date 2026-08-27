-- LegalInsure - splits the users and policies tables, which had grown too
-- wide, into smaller tables by concern:
--   users     -> users (core identity)          + user_profiles (KYC/underwriting profile)
--   policies  -> policies (operational record)  + policy_disclosures (consent/disclosures)
--                                                + policy_banking (payment collection)
--
-- Purely a schema/storage change - the API's JSON shape is unaffected (see
-- users_bp.serialize_user and policies_bp.serialize_policy, which merge the
-- split tables back into the same flat dicts the frontend already expects).
--
-- Guarded and idempotent like the other MIGRATE_*.sql scripts - safe to run
-- against your existing DB, and safe to re-run. Each block is separated by
-- GO for the same reason as MIGRATE_PROFILE_FIELDS.sql: SQL Server compiles
-- a whole batch before running any of it, so a later block that depends on
-- an earlier block's DDL (e.g. copying data into a table just created) has
-- to be its own batch.
--
-- If you're setting up a brand-new database instead, just run the current
-- SEED_DATA.sql - it already includes the split schema.

-- ============================================================
-- New tables
-- ============================================================

IF OBJECT_ID('user_profiles', 'U') IS NULL
BEGIN
    CREATE TABLE user_profiles
    (
        user_id NVARCHAR(50) PRIMARY KEY,
        date_of_birth DATE NULL,
        id_number NVARCHAR(20) NULL,
        address NVARCHAR(255) NULL,
        employer_name NVARCHAR(150) NULL,
        occupation NVARCHAR(100) NULL,
        employment_status NVARCHAR(20) NULL
            CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'retired', 'student')),
        marital_status NVARCHAR(20) NULL
            CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
        CONSTRAINT FK_user_profiles_users FOREIGN KEY (user_id) REFERENCES users(id)
    );
END
GO

IF OBJECT_ID('policy_disclosures', 'U') IS NULL
BEGIN
    CREATE TABLE policy_disclosures
    (
        policy_id NVARCHAR(50) PRIMARY KEY,
        has_pre_existing_dispute BIT NOT NULL DEFAULT 0,
        pre_existing_dispute_details NVARCHAR(1000) NULL,
        personal_use_confirmed BIT NOT NULL DEFAULT 0,
        popia_consent BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_policy_disclosures_policies FOREIGN KEY (policy_id) REFERENCES policies(id)
    );
END
GO

IF OBJECT_ID('policy_banking', 'U') IS NULL
BEGIN
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
END
GO

-- ============================================================
-- Copy existing data across while the old columns still exist on
-- users/policies. Each block short-circuits once its source columns are
-- gone, i.e. on a re-run after this script has already dropped them below.
--
-- These run as dynamic SQL (sp_executesql), not a plain guarded statement -
-- SQL Server compiles a whole batch up front, columns included, even inside
-- an IF that turns out false at runtime, so a static SELECT/INSERT naming
-- date_of_birth etc. fails to compile on a re-run once those columns are
-- gone. Wrapping it as a string means it's only parsed at EXEC time, when
-- the IF guard has already confirmed the columns still exist.
-- ============================================================

IF COL_LENGTH('users', 'date_of_birth') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        INSERT INTO user_profiles (user_id, date_of_birth, id_number, address, employer_name, occupation, employment_status, marital_status)
        SELECT u.id, u.date_of_birth, u.id_number, u.address, u.employer_name, u.occupation, u.employment_status, u.marital_status
        FROM users u
        WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.user_id = u.id);
    ';
END
GO

IF COL_LENGTH('policies', 'has_pre_existing_dispute') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        INSERT INTO policy_disclosures (policy_id, has_pre_existing_dispute, pre_existing_dispute_details, personal_use_confirmed, popia_consent)
        SELECT pol.id, pol.has_pre_existing_dispute, pol.pre_existing_dispute_details, pol.personal_use_confirmed, pol.popia_consent
        FROM policies pol
        WHERE NOT EXISTS (SELECT 1 FROM policy_disclosures d WHERE d.policy_id = pol.id);
    ';
END
GO

IF COL_LENGTH('policies', 'payment_method') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        INSERT INTO policy_banking (policy_id, payment_method, bank_name, account_holder, account_number, branch_code)
        SELECT pol.id, pol.payment_method, pol.bank_name, pol.account_holder, pol.account_number, pol.branch_code
        FROM policies pol
        WHERE NOT EXISTS (SELECT 1 FROM policy_banking b WHERE b.policy_id = pol.id)
            AND (pol.payment_method IS NOT NULL OR pol.bank_name IS NOT NULL
                 OR pol.account_holder IS NOT NULL OR pol.account_number IS NOT NULL
                 OR pol.branch_code IS NOT NULL);
    ';
END
GO

-- ============================================================
-- Drop the now-redundant columns from users/policies. Constraint names
-- (CHECK/DEFAULT) vary depending on whether your DB got here via
-- MIGRATE_PROFILE_FIELDS.sql (named constraints) or a from-scratch
-- SEED_DATA.sql run (system-generated names) - so these are looked up
-- dynamically rather than hardcoded, then dropped before their column.
-- ============================================================

IF COL_LENGTH('users', 'date_of_birth') IS NOT NULL
BEGIN
    DECLARE @constraint_name NVARCHAR(200);
    DECLARE @sql NVARCHAR(500);

    DECLARE constraint_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT cc.name
        FROM sys.check_constraints cc
        JOIN sys.columns c ON c.object_id = cc.parent_object_id AND c.column_id = cc.parent_column_id
        WHERE cc.parent_object_id = OBJECT_ID('users')
            AND c.name IN ('employment_status', 'marital_status');

    OPEN constraint_cursor;
    FETCH NEXT FROM constraint_cursor INTO @constraint_name;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = 'ALTER TABLE users DROP CONSTRAINT ' + QUOTENAME(@constraint_name);
        EXEC sp_executesql @sql;
        FETCH NEXT FROM constraint_cursor INTO @constraint_name;
    END
    CLOSE constraint_cursor;
    DEALLOCATE constraint_cursor;

    ALTER TABLE users DROP COLUMN date_of_birth, id_number, address, employer_name, occupation, employment_status, marital_status;
END
GO

IF COL_LENGTH('policies', 'has_pre_existing_dispute') IS NOT NULL
BEGIN
    DECLARE @constraint_name NVARCHAR(200);
    DECLARE @sql NVARCHAR(500);

    -- DEFAULT constraints on the three BIT flags, plus any CHECK constraint
    -- on payment_method - both kinds block a DROP COLUMN if left in place.
    DECLARE constraint_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT dc.name
        FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('policies')
            AND c.name IN ('has_pre_existing_dispute', 'personal_use_confirmed', 'popia_consent')
        UNION ALL
        SELECT cc.name
        FROM sys.check_constraints cc
        JOIN sys.columns c ON c.object_id = cc.parent_object_id AND c.column_id = cc.parent_column_id
        WHERE cc.parent_object_id = OBJECT_ID('policies')
            AND c.name = 'payment_method';

    OPEN constraint_cursor;
    FETCH NEXT FROM constraint_cursor INTO @constraint_name;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = 'ALTER TABLE policies DROP CONSTRAINT ' + QUOTENAME(@constraint_name);
        EXEC sp_executesql @sql;
        FETCH NEXT FROM constraint_cursor INTO @constraint_name;
    END
    CLOSE constraint_cursor;
    DEALLOCATE constraint_cursor;

    ALTER TABLE policies DROP COLUMN
        has_pre_existing_dispute, pre_existing_dispute_details, personal_use_confirmed, popia_consent,
        payment_method, bank_name, account_holder, account_number, branch_code;
END
GO
