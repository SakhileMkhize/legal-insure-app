-- Gives Basic and Premium real monetary cover limits instead of R0.
--
-- Previously only Ultimate had a nonzero cover_limit - Basic/Premium were
-- "service only" (consultations + AI guidance), so an approved claim on
-- those tiers could never draw down against any limit. In practice this
-- meant a claim could be "Approved" while nothing financial happened,
-- which doesn't hold up: approving a claim should always mean the
-- insurer is paying to fix the client's problem, regardless of plan
-- tier - every researched competitor prices cover this way too (see
-- business_model.md's Competitor Landscape section), lower tiers just
-- get a lower cap, not zero.
--
-- Safe to re-run: sets fixed values rather than incrementing, so running
-- it twice is a no-op the second time.

UPDATE plans SET cover_limit = 100000 WHERE id = 'basic';
UPDATE plans SET cover_limit = 250000 WHERE id = 'premium';
GO

-- Existing policies snapshot cover_limit from the plan at signup time
-- (see users_bp.py's create_user), so already-issued Basic/Premium
-- policies are still sitting on the old value and won't pick up the
-- plans-table change on their own.
UPDATE p
SET p.cover_limit = pl.cover_limit
FROM policies p
JOIN plans pl ON pl.id = p.plan_id
WHERE pl.id IN ('basic', 'premium');
GO

IF NOT EXISTS (
    SELECT 1 FROM plan_features
    WHERE plan_id = 'basic' AND feature = 'Legal expense cover up to R100,000'
)
INSERT INTO plan_features (plan_id, feature, sort_order)
VALUES ('basic', 'Legal expense cover up to R100,000', 3);
GO

IF NOT EXISTS (
    SELECT 1 FROM plan_features
    WHERE plan_id = 'premium' AND feature = 'Legal expense cover up to R250,000'
)
INSERT INTO plan_features (plan_id, feature, sort_order)
VALUES ('premium', 'Legal expense cover up to R250,000', 4);
GO
