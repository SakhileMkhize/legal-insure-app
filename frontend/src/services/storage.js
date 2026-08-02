// Seeds each collection into localStorage on first read so writes (new
// signups, submitted claims, booked consultations) persist across refreshes.
export function readCollection(key, seed) {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
}

export function writeCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

export const STORAGE_KEYS = {
    users: "li_users",
    policies: "li_policies",
    claims: "li_claims",
    consultations: "li_consultations",
};
