// Builds the Authorization header (and Content-Type, for write requests)
// shared by every fetch call on this page, to avoid repeating it in each
// section component.
export function authHeaders(json = false) {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
}
