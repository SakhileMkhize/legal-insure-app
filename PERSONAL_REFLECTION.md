# Personal Reflection

**Sakhile Mkhize | Class of 2026 | Digital Track | Sanlam**

## Most important learning

Working code is not the same as finished code, it can run correctly and still be poorly written. That means paying attention to things like clean syntax, not repeating the same logic in two places when it could be one reusable piece, leaving a comment where the reasoning isn't obvious from the code alone, and splitting a large component into smaller, focused pieces instead of letting one file try to do everything. Those habits don't change what an app does, but they change whether anyone, including me later, can actually work with it.

*Example: the backend is split into one model per entity under `backend/models/` and six route blueprints under `backend/routes/`, and frontend pages such as Claims, Dashboard, and AdminClaims are each broken into an `index.jsx` plus separate `sections/` and `dialogs/` folders, rather than one large file trying to do everything.*

## What I can now do independently

Debugging. I can now sit with an error and work through it methodically, narrowing down where it's actually coming from, instead of needing someone else to point me straight at the fix.

## A strength I demonstrated

Reading the trainer's own documentation and previous repos closely, to actually understand what needed to be built before starting on it, rather than assuming I already knew the answer or vibe-coding my way toward something that looked right.

*Example: the initial AI-generated business model `LegalInsure_Capstone_Requirements.md` in this repository was the reference used to work out what the build actually needed to cover, rather than assuming based on what a typical Flask app looks like.*

## A skill or habit that still needs development

Committing smaller and more often. My commits tend to bundle several changes together rather than being broken into smaller, reviewable steps, and that's something I want to get more disciplined about.

*Example: commits in this repository's own history, such as "database migration" and "refactor", each bundle several changes into one commit rather than being split into smaller, reviewable steps.*

## A major challenge, how I responded, and what it taught me

The hardest part of building this project was working with Flask and setting up the database migrations. I got through it by turning to AI for help rather than trying to push through it alone. That taught me that knowing when to ask for help, and how to use it well, is part of learning something new under time pressure, not a shortcut around actually learning it.

*Example: the schema changes tracked in files like `backend/MIGRATE_SPLIT_USERS_POLICIES.sql` and `backend/MIGRATE_PROFILE_FIELDS.sql` reflect the kind of structural database change that made this part difficult.*

## What I would do differently next time

Design the components first, then plug them into pages, rather than building the pages first and figuring out the components along the way.

## My next specific learning goal

Auth. I want to understand how authentication and authorization actually work underneath, rather than working with a login flow that's already scaffolded for me.
