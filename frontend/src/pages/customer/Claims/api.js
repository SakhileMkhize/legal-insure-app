import { API_URL } from "../../../../global";

// Uploads one or more files against an existing claim id. Shared by both
// the "Submit New Claim" dialog and the "Attach evidence" control on an
// already-submitted claim.
export function uploadClaimDocuments(claimId, fileList) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    fileList.forEach((file) => formData.append("files", file));

    return fetch(`${API_URL}/claims/${claimId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    }).then((response) =>
        response
            .json()
            .then((data) =>
                response.ok ? data : Promise.reject(new Error(data.message)),
            ),
    );
}
