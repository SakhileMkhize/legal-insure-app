-- LegalInsure - migration adding usage-tracked policy benefits (will &
-- estate documenting, traffic fine cover, pre-claim consultation, identity
-- theft assistance) to an already-running database.
--

IF OBJECT_ID('benefits', 'U') IS NULL
BEGIN
    CREATE TABLE benefits
    (
        id NVARCHAR(20) PRIMARY KEY,
        label NVARCHAR(150) NOT NULL,
        description NVARCHAR(1000) NOT NULL,
        usage_limit_count INT NULL,
        usage_limit_amount DECIMAL(10, 2) NULL,
        period NVARCHAR(20) NOT NULL DEFAULT 'annual'
    );
END
GO

IF OBJECT_ID('policy_benefits', 'U') IS NULL
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1
FROM benefits
WHERE id = 'will-estate')
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1
FROM policy_benefits
WHERE policy_id = 'p1' AND benefit_id = 'will-estate')
BEGIN
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
END
GO
