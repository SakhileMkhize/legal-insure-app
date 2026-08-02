# LegalInsure — Business Model

This document exists to keep the product grounded in how legal expense
insurance actually has to work, so that app features and mock data reflect
real insurance mechanics rather than generic SaaS CRUD. It's a living
document — update it whenever a business rule changes, and treat any app
behaviour that contradicts it as a bug.

Sources drawn on: prior discussion in this project, general SA short-term
insurance practice (LegalWise/Clientèle Legal/Santam Legal-style products),
and researched notes on legal-plan structures (MetLife Legal Plans, ARAG,
LegalShield) and insurance-client onboarding practice. US-specific pricing
and matters (traffic tickets, state-specific document packs) were left out —
not applicable to a Rand-denominated, SA-law product. Internal
employee/law-firm-staff onboarding material was also left out — we're
onboarding *policyholders*, not legal officers or law firm staff; that's a
different business entirely.

---

## 1. Classification

**Short-term (non-life) insurance**, sold as a monthly rolling subscription.

- No cash/investment value, no maturity, no payout on death.
- Community-rated pricing: a flat premium per tier, the same for every
  member regardless of age or health. No individual medical underwriting —
  this is one of the reasons the product can be priced this low.
- Cancel anytime, no penalty, no multi-year tie-in.
- **Statutory cooling-off period:** 30 days from policy start, full refund,
  provided no claim has been made in that window. Standard for SA
  short-term insurance and worth surfacing to the client, not hiding in
  fine print.

*Real-world note (not implemented): selling this product in South Africa
would require FSCA short-term insurance licensing and the sales channel
would need FAIS accreditation. Out of scope for the capstone, but the
product design should behave as if it takes this seriously.*

---

## 2. Target Market

- **Primary — B2C:** working individuals and families, roughly LSM 5–8.
  Employed or self-employed, likely renting or paying off a home, possibly
  with dependants. Earn enough to afford R99–R399/month, not enough to
  retain a private attorney (~R2,000–R4,000+/hour in SA).
- **Secondary — B2B/institutional:** employers buying group cover for
  staff (payroll deduction), same model as group life/medical aid
  distribution. **Not self-service today** — the onboarding flow shows a
  "call 0860 100 1000" note for institutional enquiries, and nothing more.
  This channel exists on paper so the product story is complete, but no
  group-billing, multi-seat, or employer-admin functionality is being
  built for the capstone.

---

## 3. Product Structure

| Plan | Price | Consultations | Litigation cover | Positioning |
|---|---|---|---|---|
| Basic | R99/mo | 0 | None | AI guidance + document templates only |
| Premium | R199/mo | 2/month | None | Real attorney access, no litigation funding |
| Ultimate | R399/mo | Unlimited | Up to R500,000/year *(open — see §7)* | Full legal expense cover |

**Cover categories:** labour disputes, consumer claims, civil litigation,
property disputes, estate & wills, contract review.

**Two distinct benefit types**, which is why the app has two separate
features rather than one generic "requests" list:

- **Service benefit → Consultations.** We arrange and pay a panel attorney
  directly. No cash changes hands with the member; it's just a booking
  against their monthly allowance.
- **Indemnity benefit → Claims.** We pay (or reimburse) actual litigation/
  representation costs, up to the cover limit, only after the approval
  process in §5.

**Dependant cover:** main member + declared spouse/partner + children
(under 21, or under 25 if a full-time student). **Open decision:** free vs.
a small per-dependant add-on (recommend the latter — more realistic, and
gives the pricing model depth beyond three flat tiers). *App gap: there is
currently no dependant-management step anywhere in onboarding — see §4.*

**Waiting period:** 30 days before any indemnity (Claims) benefit can be
used. Service benefits (AI guidance, document templates, consultations)
are available from day one — the waiting period exists specifically to
stop someone joining the day before a dispute they already know about, not
to gatekeep everyday advice.

**Standard exclusions:**
- Matters that existed, or the member was aware of, before the policy
  started (see the pre-existing-dispute disclosure in §4)
- Anything within the 30-day waiting period
- Criminal matters where the member is ultimately found guilty
- Disputes between the member and us (the insurer)
- Business/trading disputes (personal lines only — no SME add-on for now)
- Claims with no reasonable prospect of success (this is the actual
  underwriting decision at claim time, not a technicality — see §5)

---

## 4. Client Onboarding — what we need to know before confirming a policy

This is the core question this document exists to answer. The list below
is organised by what the information is *for*, with an honest status
against what the app currently collects (`firstName`, `lastName`, `email`,
`phone`, `planId`, `password`, `acceptTerms` — and nothing else).

| # | What we need | Why | Status |
|---|---|---|---|
| 1 | Full name, date of birth | Confirm the member is 18+; needed to calculate dependant age-eligibility later | ⚠️ DOB missing |
| 2 | SA ID or passport number | Identity verification (KYC/FICA-style) — every real insurer collects this before confirming a policy | ❌ Gap |
| 3 | Residential address | Legal matters are often jurisdiction/court-specific; also required for property-dispute claims | ❌ Gap |
| 4 | Email + phone | Contact and portal login | ✅ Collected |
| 5 | Plan tier | Determines cover | ✅ Collected |
| 6 | Dependants (name, DOB, ID, relationship) | Who else is covered under this policy | ❌ Gap — no step exists at all |
| 7 | **Pre-existing dispute disclosure** — "Do you currently have, or are you aware of, any pending legal dispute or matter?" | **The single most important underwriting question in legal insurance.** If yes, that specific matter is permanently excluded — this is what stops someone signing up the moment they get a letter of demand. Without this question, the waiting period alone is a weak control. | ❌ Gap — not asked anywhere |
| 8 | Personal-use acknowledgment | Confirms the member understands this is personal, not business, cover | ❌ Gap (currently only implied by "Terms of Service") |
| 9 | Payment method | Debit order or card | Out of scope — see §7 |
| 10 | Terms of Service + Policy Wording acceptance | Legal agreement | ✅ Collected (generic checkbox) |
| 11 | **POPIA consent**, named explicitly | Legal matters can reveal sensitive personal information (health, criminal, family status) — this deserves its own explicit consent, not a bundled "Terms" checkbox | ⚠️ Only implicit today |
| 12 | Waiting-period acknowledgment | Currently only sits in Plans page FAQ copy — a client committing to a policy should see this at the point of signing, not have to have read the FAQ first | ❌ Gap |
| 13 | Policy summary / schedule before final confirmation | A "review before you confirm" step — the confirmation page today only shows plan name + price | ⚠️ Partial |

**Deliberately *not* asked at onboarding** (kept for §5 instead, to keep
signup friction low): criminal record status. The criminal-guilt exclusion
only matters if a claim is ever made, so it's enforced at claim-assessment
time rather than interrogated on day one. Asking it upfront would raise
onboarding friction for a check that's rarely relevant.

**Implication for the app:** items 1, 2, 3, 6, 7, 8, 11, and 12 represent
real gaps between what the onboarding flow collects and what a policy
actually needs before it can be responsibly confirmed. The most important
one to close first, if/when we extend onboarding, is **#7** — it's the
question that makes the rest of the exclusion logic mean anything.

---

## 5. Claims — approval/rejection logic

A claim is only approved if, **in this order**:

1. Policy is active and premiums are up to date (lapsed = no cover)
2. Category is covered under the member's plan tier (Basic has no
   litigation cover at all)
3. Past the 30-day waiting period
4. Within the annual cover limit (once exhausted, further claims that
   period are declined regardless of merit)
5. **Reasonable prospect of success** — the actual underwriting judgement:
   would this likely succeed, or does it have no legal basis? This is what
   the Admin's approve/reject decision in the app represents.

Claim statuses map onto this directly: **Pending** → not yet assessed,
**In Review** → missing information or under active assessment,
**Approved/Rejected** → decision made against steps 1–5 above. A rejection
for weak merits (step 5) is a different thing from a rejection for an
exclusion (steps 1–4) — worth distinguishing in claim decision notes if we
ever build that out.

---

## 6. Client Retention

Legal insurance has a structural retention problem: **most months, nothing
happens.** Unlike medical aid (used constantly) or car insurance (visible
asset), a member can go a year without any reason to log in — and then
wonder why they're still paying for it. Retention has to come from
*perceived value*, not contractual lock-in, because there isn't any
lock-in (see §1 — cancel anytime).

- **Engagement over dormancy.** Proactive nudges: unused consultation
  allowance reminders ("you have 2 consultations left this month"),
  document-template usage prompts, an annual "review your will" campaign.
  The goal is making the AI guidance and document tools feel used
  regularly, not just insurance sitting silently in the background.
- **Claims experience is the #1 retention lever.** A slow or opaque claim
  is the single biggest churn driver in insurance generally. Clear status
  progression (Pending → In Review → decision, with a reason) matters more
  for retention than almost any other feature.
- **At-risk signals, not silent churn.** Missed premium payment, a
  downgrade request, declining login frequency — these should flag a
  human follow-up (call centre), not just quietly lapse the policy.
- **No-claim incentive.** A loyalty discount after 12–24 claim-free months
  mirrors the no-claim-bonus concept from car/home insurance and rewards
  the majority of members who never claim.
- **Referral loop.** Small discount for adding a household member as a
  paid dependant, or for referring a new member — cheap acquisition, and
  reinforces the "cover your whole household" framing from §3.
- **Feedback loop.** Short NPS/CSAT prompt after a claim resolution or
  consultation — this is precisely the moment retention risk is highest
  (good or bad experience), so it's the highest-value moment to listen.

---

## 7. Explicitly deferred (capstone scope)

These are real requirements for an actual insurance business, intentionally
not built here — noted so nobody mistakes the absence for an oversight:

- Real payment processing / debit order collection
- Real ID/FICA document verification (upload, OCR)
- Real attorney panel integration (partner APIs are mocked/seeded)
- Employer/group self-service billing portal (institutional = phone only)
- FSCA/FAIS regulatory licensing
- Ultimate plan's R500,000 cover limit — carried over from initial design,
  not yet validated against what's realistic for the SA market (LegalWise-
  style products often cap lower, R100k–R250k) — open decision
- Dependant pricing model (free vs. per-dependant add-on) — open decision
