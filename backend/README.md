# Backend

Nothing lives here yet. This folder is reserved for a real backend (an
actual server + database) to eventually replace the mock data layer.

**Important - this is not that yet.** Today, everything this app treats
as "data" (`frontend/src/services`, `frontend/src/data`) is mock logic
that runs entirely in the browser, backed by `localStorage`. There is no
server, no database, and no network request involved anywhere in the app
right now - see `../business_model.md` and `../LegalInsure_Capstone_Requirements.md`
for the intended real architecture (Flask API + SQL Server) this folder
is meant to hold.

When a real backend is built, it belongs here, separate from the React
app in `../frontend`.
