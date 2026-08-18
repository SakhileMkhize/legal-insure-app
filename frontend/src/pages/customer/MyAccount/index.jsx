import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { PLANS } from "../../../data/mockPlans";
import { API_URL } from "../../../../global";
import { authHeaders } from "./authHeaders";
import { ProfileCard } from "./sections/ProfileCard";
import { CurrentPlanCard } from "./sections/CurrentPlanCard";
import { EmploymentSection } from "./sections/EmploymentSection";
import { BankingSection } from "./sections/BankingSection";
import { LegalHistorySection } from "./sections/LegalHistorySection";
import { NextOfKinSection } from "./sections/NextOfKinSection";

// One component per card lives under ./sections, each owning its own edit
// dialog - this file only owns the four data fetches and hands each
// section the slice of state (plus an update callback) it needs.
export function MyAccount() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [legalHistory, setLegalHistory] = useState([]);
    const [nextOfKin, setNextOfKin] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);

    // Fetches everything the page shows in one go: profile, policy,
    // disclosed legal history, and next-of-kin contacts.
    const loadAll = () => {
        setLoading(true);
        setError(null);
        Promise.all([
            fetch(`${API_URL}/auth/me`, { headers: authHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/policies/me`, { headers: authHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/auth/me/legal-history`, { headers: authHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/auth/me/next-of-kin`, { headers: authHeaders() }).then((r) => r.json()),
        ])
            .then(([userData, policyData, historyData, kinData]) => {
                setCurrentUser(userData);
                setPolicy(policyData);
                setLegalHistory(Array.isArray(historyData) ? historyData : []);
                setNextOfKin(Array.isArray(kinData) ? kinData : []);
            })
            .catch(() => setError("We couldn't load your account right now."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const plan = policy ? PLANS.find((p) => p.id === policy.planId) : null;

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                My Account
            </Typography>

            {actionError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setActionError(null)}
                >
                    {actionError}
                </Alert>
            )}

            {/* Profile summary and current plan, side by side. */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <ProfileCard currentUser={currentUser} onLogout={handleLogout} />
                <CurrentPlanCard plan={plan} navigate={navigate} />
            </Box>

            {/* Employment and Banking - each shows a read-only summary
                and an edit dialog of its own. */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <EmploymentSection
                    currentUser={currentUser}
                    onSaved={setCurrentUser}
                    onError={setActionError}
                />
                <BankingSection
                    policy={policy}
                    onSaved={setPolicy}
                    onError={setActionError}
                />
            </Box>

            {/* Legal History and Next of Kin - each is a list with its
                own "Add" dialog; Next of Kin entries can also be deleted
                inline. */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <LegalHistorySection
                    legalHistory={legalHistory}
                    onAdded={(entry) =>
                        setLegalHistory((prev) => [entry, ...prev])
                    }
                    onError={setActionError}
                />
                <NextOfKinSection
                    nextOfKin={nextOfKin}
                    onAdded={(contact) =>
                        setNextOfKin((prev) => [...prev, contact])
                    }
                    onRemoved={(contactId) =>
                        setNextOfKin((prev) =>
                            prev.filter((c) => c.id !== contactId),
                        )
                    }
                    onError={setActionError}
                />
            </Box>
        </Box>
    );
}
