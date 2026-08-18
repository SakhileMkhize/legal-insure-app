import { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { StatusChip } from "../../../../components/common/StatusChip";
import { downloadAuthenticatedFile } from "../../../../utils/downloadFile";
import { API_URL } from "../../../../../global";

// Read-only detail view for one claim, including its attached evidence -
// "claim" doubles as both the open/closed flag and the data source, so
// there's no separate boolean to keep in sync.
export function ClaimReviewDialog({ claim, onClose }) {
    const [documents, setDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);

    // Loads the evidence list for whichever claim is open; clears it again
    // once the dialog closes so stale documents from a previous claim
    // can't flash on the next one.
    useEffect(() => {
        if (!claim) {
            setDocuments([]);
            return;
        }

        setDocumentsLoading(true);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/claims/${claim.id}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then(setDocuments)
            .catch(() => setDocuments([]))
            .finally(() => setDocumentsLoading(false));
    }, [claim]);

    return (
        <Dialog open={Boolean(claim)} onClose={onClose} fullWidth maxWidth="sm">
            {claim && (
                <>
                    <DialogTitle>{claim.title}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={1.5}>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Claimant
                                </Typography>
                                <Typography variant="body2">
                                    {claim.clientName}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Category
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ textTransform: "capitalize" }}
                                >
                                    {claim.category}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Amount Claimed
                                </Typography>
                                <Typography variant="body2">
                                    R{claim.amountClaimed.toLocaleString()}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Status
                                </Typography>
                                <StatusChip status={claim.status} />
                            </Stack>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Description
                            </Typography>
                            <Typography variant="body2">
                                {claim.description}
                            </Typography>

                            {/* Evidence the client attached, downloadable so
                                a decision can be based on the actual
                                supporting documents. */}
                            <Divider sx={{ my: 0.5 }} />

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                            >
                                EVIDENCE
                            </Typography>

                            {documentsLoading && <CircularProgress size={16} />}
                            {!documentsLoading && documents.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No documents attached to this claim.
                                </Typography>
                            )}
                            <Stack spacing={0.5}>
                                {documents.map((doc) => (
                                    <Stack
                                        key={doc.id}
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <InsertDriveFileIcon
                                            fontSize="small"
                                            color="action"
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ flex: 1 }}
                                            noWrap
                                        >
                                            {doc.fileName}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                downloadAuthenticatedFile(
                                                    `${API_URL}/claims/documents/${doc.id}/download`,
                                                    doc.fileName,
                                                )
                                            }
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Close</Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
