// Always renders full dates (e.g. "12 August 2026") instead of locale-dependent
// numeric formats like "12/08/2026", regardless of the visitor's browser locale.
export function formatDate(dateInput) {
    return new Date(dateInput).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatDateTime(dateInput) {
    const date = new Date(dateInput);
    const time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${formatDate(date)}, ${time}`;
}
