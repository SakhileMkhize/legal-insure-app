import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { API_URL } from "../../../../global";
import { ClaimsTable } from "./sections/ClaimsTable";
import { ClaimReviewDialog } from "./dialogs/ClaimReviewDialog";

// "pending" groups both pending and in-review statuses under one tab; the
// other three tabs map straight to a single status value.
const TABS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

// Table and review-dialog live under ./sections and ./dialogs - this file
// only owns the claim list, the active tab, and the approve/reject action.
export function AdminClaims() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("all");
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [actionError, setActionError] = useState(null);

    const loadClaims = () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/claims/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then(setClaims)
            .catch(() => setError("We couldn't load claims right now."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadClaims();
    }, []);

    // Applies the active tab against the already-loaded full claim list.
    const filteredClaims = useMemo(() => {
        if (tab === "all") return claims;
        if (tab === "pending")
            return claims.filter(
                (c) => c.status === "pending" || c.status === "in-review",
            );
        return claims.filter((c) => c.status === tab);
    }, [claims, tab]);

    // Approve/reject both go through the same status-update endpoint,
    // differing only in the status value sent.
    const handleDecision = (claimId, status) => {
        setActionError(null);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/claims/${claimId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        })
            .then((response) => response.json())
            .then(loadClaims)
            .catch(() =>
                setActionError(
                    "We couldn't update this claim. Please try again.",
                ),
            );
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Claims Management
            </Typography>

            <Tabs
                value={tab}
                onChange={(event, newValue) => setTab(newValue)}
                sx={{ mb: 3 }}
            >
                {TABS.map((t) => (
                    <Tab key={t.value} value={t.value} label={t.label} />
                ))}
            </Tabs>

            {actionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {actionError}
                </Alert>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <ClaimsTable
                    claims={filteredClaims}
                    onSelect={setSelectedClaim}
                    onDecision={handleDecision}
                />
            )}

            <ClaimReviewDialog
                claim={selectedClaim}
                onClose={() => setSelectedClaim(null)}
            />
        </Box>
    );
}
