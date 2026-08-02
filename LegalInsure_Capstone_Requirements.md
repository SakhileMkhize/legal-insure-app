# CAPSTONE PROJECT REQUIREMENTS

# LegalInsure

### Web-Based Legal Insurance & Legal Cover Management Application

| | |
|---|---|
| **Frontend** | React, HTML, CSS, MUI |
| **Backend** | Flask (Python) REST API |
| **Database** | Microsoft SQL Server |
| **Cloud Deployment** | TBD |

*Version 1.0 • July 2026*

---

## 1. Project Objective

Develop a comprehensive web-based legal insurance management application that enables users to manage their legal cover and dependants, request and track legal expense claims, book and compare consultations with attorneys and law firm partners, and access legal guidance content through an intuitive interface.

> **Scope note:** The capstone focuses on cover onboarding, dependant management, consultation booking, and claim submission/tracking workflows. Live attorney-network integrations, online premium payment, and production law-firm API integrations are outside the core scope unless separately approved and supported by partner APIs.

---

## 2. Proposed Solution Architecture

| Layer | Technology | Primary Responsibility |
|---|---|---|
| Client application | React, HTML, CSS, MUI | Responsive user interface, routing, forms, validation, state management, and API consumption. |
| Application API | Flask (Python) | REST endpoints, authentication, authorization, validation, business logic, and partner request orchestration. |
| Data access | SQLAlchemy ORM + SQL Server driver | Model mapping, transactions, relationships, and parameterized database access. |
| Database | Microsoft SQL Server | Persistent storage for users, policies, dependants, claims, consultations, partners, FAQs, and contact enquiries. |
| External services | Attorney/law-firm partner APIs or mock adapters | Consultation availability requests, booking confirmations, and claim-decision webhooks to and from partners. |
| Deployment | Cloud platform: TBD | Hosting, configuration, secrets, logging, monitoring, and database connectivity. |

---

## 3. Functional Requirements

### 3.1. User Management

- Allow users to register using their name, email address, contact information, and password.
- Store passwords using a strong one-way password-hashing algorithm; plain-text passwords must never be stored.
- Provide login and logout functionality through secure authentication endpoints.
- Provide password recovery using a time-limited reset token and a reset-password workflow.
- Allow authenticated users to view and edit their profile information.
- Support two roles — **Customer** and **Admin** — with role-based landing pages and navigation.

### 3.2. Policy & Cover Management

- Allow users to view their active legal cover plan (Basic, Premium, or Ultimate) and its details: monthly premium, start date, and status.
- Capture or calculate the cover categories included, consultations included/used, and the Insured Legal Expense Limit according to the agreed business rule; the calculation rule may be mocked for the capstone.
- Allow users to upgrade, downgrade, or cancel their plan.
- Display a summary view of the logged-in user's policy and cover usage.

### 3.3. Dependant Management

- Allow users to add, view, update, and delete dependants covered under their policy.
- Capture dependant name, date of birth, ID/passport number, relationship to the policyholder, and cover eligibility.
- Associate one or more dependants with the policyholder's active plan where required by the cover terms.

### 3.4. Consultation & Attorney Matching

- Initiate a consultation request using validated matter category, urgency, and cover-eligibility information.
- Display available attorneys/partners and their proposed consultation slots in an organized card-based layout.
- Provide comparison covering specialization, hourly rate, years of experience, rating, response time, and availability window.
- Allow users to select a preferred attorney and time slot, and display a clear confirmation before booking.
- Send the selected consultation booking to the relevant partner adapter and store the booking status and partner reference when available.
- Provide a consultation-history view for the authenticated user.

### 3.5. Claims Management

- Allow users to submit a legal expense claim linked to a covered matter category and their active policy.
- Capture claim title, category, description, and amount claimed.
- Validate claim eligibility against the policy's cover limit and covered categories.
- Display claim status (Pending, In Review, Approved, Rejected) with submission and decision dates.
- Provide a claims-history view for the authenticated user.
- Allow authorized staff (Admin) to review, approve, or reject submitted claims.

### 3.6. Partner Integration

- Display attorney/law firm partners with photo or logo, name, specialization(s), bio, contact details, and a summary of services.
- Provide a dedicated detail page for each partner.
- Use a modular adapter or service pattern so partner-specific API logic does not leak into general claims or consultation-management code.
- When live partner systems are unavailable, use documented mock endpoints or seeded partner data that reproduce the expected request and response structure.

### 3.7. Content and Customer Support

- Provide an FAQ page grouped by topic, with search or expandable sections for easy navigation.
- Provide a Contact Us form for users to submit questions to customer support.
- Validate and store contact submissions with a status such as New, In Progress, or Resolved.

---

## 4. Technical Requirements

### 4.1 Frontend — React

- Build the user interface using React with reusable functional components and hooks.
- Use React Router for client-side navigation and protected, role-based routes.
- Use MUI (Material UI), HTML, and CSS for responsive layouts and consistent styling, themed around the LegalInsure navy-and-yellow brand palette.
- Implement controlled forms with client-side validation and clear validation messages.
- Consume Flask REST APIs using fetch or Axios and handle loading, success, empty, and error states.
- Organize code by feature or domain, such as auth, policies, dependants, claims, consultations, partners, FAQ, and contact.
- Use environment variables for the API base URL; do not hard-code environment-specific URLs.

### 4.2 Backend — Flask (Python)

- Expose versioned RESTful endpoints that exchange JSON with the React application.
- Use Flask Blueprints to separate authentication, users, policies, dependants, claims, consultations, partners, FAQ, and contact modules.
- Use SQLAlchemy ORM for database access and migrations for controlled schema changes.
- Implement authentication and role-based authorization (Customer vs. Admin) where required.
- Validate and sanitize all incoming request data on the server, regardless of frontend validation.
- Return consistent HTTP status codes and structured error responses.
- Configure CORS only for approved frontend origins.
- Use centralized exception handling, application logging, and configuration per environment.

### 4.3 Database — Microsoft SQL Server

- Use Microsoft SQL Server as the relational database and connect through SQLAlchemy using a supported SQL Server driver.
- Define normalized entities and relationships for Users, Policies, Dependants, PolicyDependants, Partners, Claims, ClaimDocuments, Consultations, FAQs, and ContactEnquiries.
- Apply primary keys, foreign keys, unique constraints, indexes, nullability rules, and appropriate data types.
- Use migrations and seed data for repeatable setup of partner, plan, FAQ, and demonstration records.
- Use transactions for multi-step operations such as claim submission and consultation booking.

### 4.4 Suggested Core API Areas

| API Area | Representative Operations |
|---|---|
| Authentication | Register, login, logout, current user, forgot password, reset password |
| Profile | View and update authenticated user profile |
| Policies | View active policy, list plans, upgrade/downgrade/cancel plan |
| Dependants | Create, list, retrieve, update, and delete covered dependants |
| Claims | Submit claim, list claims, retrieve claim detail, approve/reject (admin), view history |
| Consultations | Request consultation, list available partners/slots, book, view history |
| Partners | List partners and retrieve partner details |
| Content | List FAQ categories and FAQs; submit contact enquiry |

---

## 5. Security Requirements

- Hash passwords with a modern adaptive algorithm such as Argon2id or bcrypt.
- Prefer short-lived access tokens or server-managed sessions delivered through Secure, HttpOnly, SameSite cookies; avoid storing sensitive authentication tokens in localStorage.
- Enforce record ownership so users cannot access or modify another user's profile, policy, dependants, claims, or consultations.
- Protect password-reset tokens with short expiry, one-time use, and secure storage.
- Use parameterized ORM queries, server-side validation, output encoding, and safe error messages.
- Keep secrets, database credentials, and API keys outside source control using environment-specific configuration.
- Use HTTPS in deployed environments and avoid logging passwords, access tokens, or sensitive personal information.
- Align data handling with POPIA (Protection of Personal Information Act) principles given the sensitivity of legal and personal dependant information.

---

## 6. Non-Functional Requirements

- Responsive design and compatibility with current desktop, tablet, and mobile browsers.
- Intuitive navigation with clear feedback for user actions, validation failures, and API errors.
- Modular, readable, maintainable, and scalable frontend and backend code structures.
- Reasonable application performance using pagination, database indexes, efficient queries, and controlled API payloads.
- Accessibility-conscious interfaces, including semantic HTML, keyboard access, visible focus, labels, and sufficient color contrast.
- Automated tests for critical business logic and API workflows, with frontend component or integration tests for major user journeys.

---

## 7. Development and Deployment

### 7.1 Local Development

- Provide instructions for installing frontend dependencies and running the React development server.
- Provide instructions for creating and activating the Python virtual environment and running Flask in development mode.
- Manage frontend dependencies through `package.json` and Python dependencies through `requirements.txt` or `pyproject.toml`.
- Provide Microsoft SQL Server database setup, migration, and seed instructions.
- Provide sample environment-variable files containing placeholders only, never real secrets.

### 7.2 Cloud Deployment — TBD

The cloud provider, hosting services, CI/CD platform, domain configuration, and managed SQL Server option will be finalized later. The application must remain deployment-ready by using environment-based configuration, production build commands, health checks, migrations, structured logs, and documented startup commands.

> **Deployment decision pending:** Potential choices may include Azure, AWS, or another approved platform. No platform-specific implementation is required until the deployment target is confirmed.

---

## 8. Evaluation Criteria

| Criterion | What Will Be Evaluated |
|---|---|
| Functional accuracy | Required workflows operate correctly and handle success, validation, empty, and failure cases. |
| UI/UX effectiveness | Responsive, consistent, accessible, and intuitive user experience. |
| Frontend quality | Reusable React components, appropriate state management, routing, form handling, and API integration. |
| Backend quality | Modular Flask design, consistent REST APIs, validation, error handling, and separation of concerns. |
| Database design | Normalization, relationships, constraints, indexing, migrations, and efficient data access. |
| Security | Secure authentication, authorization, password handling, input validation, and secrets management. |
| Testing and documentation | Meaningful test coverage and clear setup, architecture, API, and usage documentation. |
| Presentation | Clear demonstration of the problem, solution, architecture, key workflows, challenges, and future work. |

---

## 9. Deliverables

- Complete source code for the React frontend and Flask backend, with a clean repository structure.
- Microsoft SQL Server schema, migration files, and seed data required to run the application.
- README containing prerequisites, environment configuration, installation, database setup, and local run instructions.
- API documentation covering endpoints, authentication expectations, sample requests, responses, and error formats.
- Final presentation and live demonstration showcasing the complete user journey.
- Deployment-ready codebase; actual cloud deployment remains TBD until the target platform is selected.
- Brief technical report describing architecture, data model, security approach, challenges, trade-offs, limitations, and potential future improvements.

---

## 10. Minimum Demonstration Flow

- A new user registers, logs in, and updates their profile.
- The user adds a dependant, then reviews the saved summary of covered members.
- The user submits a legal expense claim for a specific matter category and reviews its status.
- The user requests a consultation, compares available attorneys, opens partner details, and selects a preferred attorney.
- The system confirms the selection, records it, and displays the consultation and claims history.
- The user reviews FAQs and submits a contact enquiry.
- An admin logs in, reviews pending claims and clients, and approves or rejects a submitted claim.

---

## 11. Future Enhancements

- Live attorney-network and law-firm API integrations with production-grade partner matching.
- Online premium payment and automated policy issuance/renewal.
- Document upload, OCR, and verification for identity documents and case evidence.
- Admin portal enhancements for partners, FAQs, enquiries, plan rules, and reporting.
- Email or SMS notifications and renewal/consultation reminders.
- Analytics dashboards, dispute-outcome tracking, audit trails, and POPIA-aligned consent management.
- AI-powered legal guidance assistant grounded in South African legislation (labour, consumer, property, and contract law).
