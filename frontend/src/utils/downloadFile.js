// Downloads a file from an authenticated API endpoint. A plain <a href> can't
// carry the Authorization header, so this fetches the bytes and triggers the
// browser download from an in-memory blob instead.
export async function downloadAuthenticatedFile(url, filename) {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error("Download failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
}
