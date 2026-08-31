# LegalInsure

<img src="frontend/src/assets/legalinsure-logo.png" alt="LegalInsure" width="260" />

Legal protection for life's disputes.

## Introduction

LegalInsure is a web-based legal expense insurance platform for the South African market. Members take out a monthly legal cover plan, manage their policy and dependants, submit and track claims, and book consultations with panel attorneys, all from a single application. An admin side lets the insurer's staff monitor the client book and assess submitted claims.

## The Insurance Problem

Legal help in South Africa is a cost problem, not an awareness problem. Attorneys typically bill R1,500 to R3,000 an hour before any work begins, yet only around 12.9% of litigants can actually afford private representation. Legal Aid exists, but its capacity is weighted toward criminal matters: only about 11% of new Legal Aid matters are civil. Meanwhile close to half the country (roughly 48.5%) lives below the national poverty line.

The result is a large, underserved middle: people who earn too much to qualify for Legal Aid's means test, but nowhere near enough to retain a private attorney. Legitimate disputes (an unfair dismissal, a bad tenancy, a contract gone wrong) routinely cost people money, a job, or a home, not because they were in the wrong, but because qualified advice was unaffordable at the moment it mattered.

## Intended Users

- **Members (customers):** individuals who buy a personal legal cover plan for themselves and their declared dependants, to get guidance, attorney access, and litigation funding for covered disputes.
- **Admin (insurer staff):** the back office team who monitor the client book and business metrics, and who assess submitted claims against the cover rules.

Employer or group cover for staff is part of the product's long-term story but is not a self-service flow in the application today; institutional enquiries are handled outside the app.

## Business Value

LegalInsure prices and structures legal help like insurance rather than selling it like a professional service. A flat monthly premium (R99 to R399) replaces an open-ended hourly bill, turning an unpredictable, potentially income-scale legal cost into a small, budgetable one. The three tiers form a ladder rather than an all-or-nothing choice: guidance and templates, then attorney access, then full litigation cover, so a member is never forced to choose between nothing and full representation.

Cover is aimed squarely at the categories Legal Aid's criminal-first mandate leaves unserved: labour disputes, consumer claims, civil litigation, property disputes, estate and wills, and contract review. Claims, evidence upload, attorney booking, and status tracking all happen in-app rather than through a call centre, which is the product's clearest point of difference from established South African legal insurance providers.

## Scope

### Completed

- Registration, login, and JWT-based authentication with role-based access
- Plan selection at signup, with a policy record created automatically
- A guided policy-build wizard covering personal details, cover category selection, dependants, disclosures (including the pre-existing dispute question and POPIA consent), and banking details
- A member dashboard showing the policy summary, cover and consultation usage, benefits, recent claims, and the next upcoming consultation
- Claim submission with category, description, and amount, evidence document upload, status tracking, and claim history
- Consultation booking against a member's monthly allowance, filtered by matter category and practitioner availability, with consultation history
- A partner and practitioner directory with individual partner detail pages
- Account management: profile, employment details, banking, next of kin, and legal history
- An admin dashboard with client-book metrics, a client list, and a claim review workflow to approve or reject submitted claims

### Excluded

- Real payment processing or debit order collection
- Real ID or FICA document verification and OCR
- Live attorney-network or law-firm partner API integrations (partner and practitioner data is seeded)
- An employer or group billing portal
- FSCA and FAIS regulatory licensing
- Password recovery (forgot password / reset password)
- Automated test coverage
- Cloud deployment: the codebase is structured to be deployment-ready, but no Terraform or cloud environment has been stood up

### May Be Added Later

Refresh tokens and stricter CORS configuration, real payment collection, live partner integrations, notification and reminder emails, and an admin portal covering partners, plan rules, and reporting. See Future Functionality and Development Themes below for the fuller picture.

## Technology Stack

LegalInsure is built with a React (Vite, MUI) frontend, a Flask (Python) REST API backend, and a Microsoft SQL Server database accessed through SQLAlchemy.

## Roles

### Customer

The default role assigned on signup. A customer can only view and manage their own policy, dependants, claims, consultations, and account details. Every customer-scoped API route filters by the identity carried in the JWT, so one member can never read or change another member's records.

### Admin

A back office role with access to the admin dashboard, the full client list, and the claim review workflow. Admin routes are gated on the role claim embedded in the JWT at login; a customer token is rejected from every admin-only route regardless of what it requests.

## Main Features

- **Onboarding:** plan selection, account creation, and a policy-build wizard that captures cover categories, dependants, disclosures, and banking details
- **Dashboard:** policy status, cover and consultation usage at a glance, recent claims, and the next upcoming consultation
- **Claims:** submit a claim against a covered category, attach supporting evidence, track its status, and review claim history
- **Consultations:** browse practitioners by matter category, book a slot against the plan's monthly allowance, and review consultation history
- **Partners:** browse the panel of law firms and practitioners, with a detail page per partner
- **My Account:** manage profile, employment, banking, next of kin, and legal history
- **Admin dashboard:** client-book metrics, a searchable client list, and a claim review dialog to approve or reject submitted claims

## End-to-End Workflows

1. **Sign up:** a prospective member chooses a plan and creates an account. A policy record is created in a pending state, with nothing covered yet.
2. **Build the policy:** the member works through the policy wizard (personal details, cover categories, dependants, disclosures, banking) and the policy is activated.
3. **Submit a claim:** the member picks a covered category, describes the matter, states the amount claimed, and uploads supporting evidence. The claim starts in a Pending state.
4. **Book a consultation:** the member browses practitioners filtered by matter category, picks an available practitioner and time slot, and the booking is recorded against the plan's monthly consultation allowance.
5. **Admin review:** an admin reviews pending and in-review claims from the admin dashboard and moves each to Approved or Rejected. An approval draws down the policy's cover limit by the claimed amount; reversing an approval gives that amount back.

## Business Rules and Validations

- Every claim is assessed against five gates, in order: the policy is active, the category is covered under the member's plan tier, the claim is past the 30-day waiting period, the claim is within the policy's annual cover limit, and the matter has a reasonable prospect of success. The last gate is the actual judgement an admin makes when approving or rejecting a claim in the app.
- Consultations and claims are modelled as two distinct benefit types rather than one generic request. Consultations are a service benefit: the insurer books and pays a panel attorney directly, and no money changes hands with the member. Claims are an indemnity benefit: the insurer pays out against the cover limit only after the claim is approved.
- Every plan tier carries a real, nonzero annual cover limit (Basic up to R100,000, Premium up to R250,000, Ultimate up to R500,000), so an approved claim always means money actually moves.
- Approving a claim increases the policy's used cover by the claimed amount; reversing an approval (correcting a prior decision) gives that amount back. The change only fires when the status actually changes, so re-saving the same decision twice cannot double count, and it only applies to policies that carry a real cover limit.
- A consultation can only be booked with a practitioner who is active and who is confirmed to cover the requested matter category.
- Claim evidence uploads are restricted to PDF, JPG, JPEG, PNG, DOC, and DOCX files, with a 10MB request size limit.
- Every field a form validates in the browser (Formik and Yup) is re-validated on the server, including enumerated fields such as employment status, marital status, and payment method.
- Record ownership is enforced on every request: queries are filtered by the identity in the JWT, owner-or-admin checks guard single-record routes, and admin-only routes are gated on the role claim.
- The pre-existing dispute disclosure and POPIA consent are captured as explicit, named questions in the policy wizard rather than bundled into a generic terms checkbox, since the pre-existing dispute answer is what makes the rest of the exclusion logic meaningful.
- Banking details are write-only from the API's side: the stored account number is never returned to the client, and submitting a blank value leaves the existing value untouched instead of clearing it.

## Major Challenges and Decisions

- **Getting the cover-limit model right.** The original design gave the Basic and Premium tiers no cover limit at all, which meant a claim on either plan could be marked Approved while no money moved for the member, a contradiction in an insurance product. Every tier was given a real, nonzero limit so an approval always has a payout behind it.
- **Two benefit types instead of one.** Consultations and claims looked similar enough to model as a single "requests" table early on, but they behave differently (one books time against an allowance, the other pays out against a limit), so they were split into separate tables and separate API resources to keep that distinction honest in the data model.
- **Splitting sensitive and optional data out of the core tables.** Fields like date of birth, ID number, banking details, and disclosure answers were moved into their own one-to-one tables (user profile, policy banking, policy disclosure) rather than living on the main users and policies tables, keeping those core tables lean while the API serializer merges the split data back into the flat shape the frontend expects.
- **Containerizing only the frontend.** Packaging the backend would have meant bundling the Microsoft ODBC Driver for SQL Server and a production WSGI server into the image, and settling how it reaches SQL Server from inside a container. That was treated as a separate decision, so only the frontend is containerized for now; the backend runs directly on the host.

## Important Trade-offs

- The frontend runs in Docker while the backend runs on the host. This kept the containerization work scoped and demonstrable, at the cost of the app not starting with a single command.
- The JWT is issued to the client and sent as a bearer token rather than held in a server-managed, HttpOnly cookie session. This was simpler to build and test within the project timeline, at the cost of the token being more exposed to the client than a cookie session would be.
- CORS is left open rather than restricted to a specific frontend origin, which kept local development friction low but does not reflect how it should be configured before any real deployment.
- Partner and practitioner data is seeded directly into SQL Server instead of being served through a mock external API adapter. This made the consultation-booking flow simple to demonstrate end to end, at the cost of not exercising the integration pattern a real attorney-network API would need.
- Claim decisions are a single admin action (approve or reject) rather than a multi-stage workflow, so the In Review status exists conceptually but is not yet driven automatically by the system.

## Current Limitations

- No automated test coverage exists yet for either the API or the frontend.
- Access tokens expire after 30 minutes with no refresh token, so a member is signed out mid-session rather than renewed silently.
- CORS is unrestricted, which is acceptable for local development but not for a production deployment.
- The backend is not containerized and the application has not been deployed to a cloud environment.
- There is no payment processing, so premiums are recorded but not actually collected.
- There is no password recovery flow; a member who forgets their password cannot self-serve a reset.
- Identity documents are not verified; the ID number field is captured but not checked against any document or external source.
- Partner and practitioner data is seeded rather than sourced from a live law-firm or attorney-network API.

## Future Functionality and Development Themes

- **Payments and policy lifecycle:** real debit order or card collection, automated premium billing, and policy renewal.
- **Identity and security hardening:** refresh tokens, a stricter CORS policy, and ID or FICA document verification with OCR.
- **Attorney network integration:** replacing seeded partner data with live law-firm partner APIs behind the same adapter-style pattern the partner routes already use.
- **Engagement and retention:** email or SMS reminders for an unused consultation allowance, claim status changes, and policy renewals, since a slow or opaque claims process is the biggest churn driver in this category.
- **Admin tooling and reporting:** richer admin management of partners, plan rules, and an analytics dashboard over claims and consultations.
- **AI-assisted guidance:** an AI legal guidance assistant grounded in South African law, extending the Basic tier's document-template offering.
- **Deployment:** containerizing the backend and provisioning the cloud infrastructure the application is already structured to support.
