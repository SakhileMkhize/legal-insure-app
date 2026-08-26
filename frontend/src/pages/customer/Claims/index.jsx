import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import { API_URL } from "../../../../global";
import { uploadClaimDocuments } from "./api";
import { ClaimsSummaryStats } from "./sections/ClaimsSummaryStats";
import { ClaimsTable } from "./sections/ClaimsTable";
import { NewClaimDialog } from "./dialogs/NewClaimDialog";

// The claim-submission form lives in ./dialogs/NewClaimDialog and each
// row's expand/collapse detail in ./sections - this file only owns the
// claim list, its evidence-document cache, and the "Attach evidence"
// upload flow for an already-submitted claim.
export function Claims() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    // Evidence documents already fetched for a given claim, keyed by
    // claim id - loaded lazily, only once a row is expanded.
    const [documentsByClaim, setDocumentsByClaim] = useState({});
    const [documentsLoading, setDocumentsLoading] = useState({});
    const [uploadingId, setUploadingId] = useState(null);
    const [evidenceWarning, setEvidenceWarning] = useState(null);

    const loadClaims = () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API_URL}/claims/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/policies/me`, { headers }).then((response) => response.json()),
        ])
            .then(([claimsData, policyData]) => {
                setClaims(claimsData);
                setPolicy(policyData);
            })
            .catch(() => setError("We couldn't load your claims right now."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadClaims();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetches the evidence list for one claim - called the first time its
    // row is expanded, not up front for every claim on the page.
    const loadClaimDocuments = (claimId) => {
        setDocumentsLoading((prev) => ({ ...prev, [claimId]: true }));
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/claims/${claimId}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((docs) =>
                setDocumentsByClaim((prev) => ({ ...prev, [claimId]: docs })),
            )
            .catch(() => { })
            .finally(() =>
                setDocumentsLoading((prev) => ({ ...prev, [claimId]: false })),
            );
    };

    // Expanding a row also lazy-loads its evidence list, but only the
    // first time - documentsByClaim already having it means a re-expand
    // skips the fetch.
    const handleToggle = (claimId) => {
        const next = expandedId === claimId ? null : claimId;
        setExpandedId(next);
        if (next && !documentsByClaim[next]) {
            loadClaimDocuments(next);
        }
    };

    // Uploads evidence directly against an existing claim (as opposed to
    // the staged-files flow inside NewClaimDialog).
    const handleAttachEvidence = (claimId, event) => {
        const selected = Array.from(event.target.files);
        event.target.value = "";
        if (selected.length === 0) return;

        setEvidenceWarning(null);
        setUploadingId(claimId);
        uploadClaimDocuments(claimId, selected)
            .then((created) =>
                setDocumentsByClaim((prev) => ({
                    ...prev,
                    [claimId]: [...(prev[claimId] ?? []), ...created],
                })),
            )
            .catch((err) =>
                setEvidenceWarning(
                    err.message ||
                    "Evidence could not be uploaded. Try a PDF, JPG, PNG, DOC or DOCX under 10MB.",
                ),
            )
            .finally(() => setUploadingId(null));
    };

    return (
        <Box>
            <Stack
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    My Claims
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    disabled={policy?.status === "pending"}
                    onClick={() => setDialogOpen(true)}
                >
                    Submit New Claim
                </Button>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Track every claim you've submitted and its progress.
            </Typography>

            {!loading && !error && <ClaimsSummaryStats claims={claims} />}

            {/* Non-blocking warning shown if evidence upload fails after
                a claim was already submitted successfully. */}
            {evidenceWarning && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    onClose={() => setEvidenceWarning(null)}
                >
                    {evidenceWarning}
                </Alert>
            )}

            {!loading && policy?.status === "pending" && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                navigate("/dashboard/build-policy")
                            }
                        >
                            Build Policy
                        </Button>
                    }
                >
                    Your policy hasn't been built yet, so there's nothing to
                    claim against. Finish setting up your cover first.
                </Alert>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && claims.length === 0 && (
                <Alert severity="info">
                    You haven't submitted any claims yet.
                </Alert>
            )}
            {!loading && !error && claims.length > 0 && (
                <ClaimsTable
                    claims={claims}
                    expandedId={expandedId}
                    onToggle={handleToggle}
                    documentsByClaim={documentsByClaim}
                    documentsLoading={documentsLoading}
                    uploadingId={uploadingId}
                    onAttachEvidence={handleAttachEvidence}
                />
            )}

            <NewClaimDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreated={loadClaims}
                onEvidenceWarning={setEvidenceWarning}
            />
        </Box>
    );
}
