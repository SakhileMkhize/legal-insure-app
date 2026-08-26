import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { PLANS } from "../../../data/mockPlans";
import { API_URL } from "../../../../global";
import { BuildPolicyPrompt } from "./sections/BuildPolicyPrompt";
import { BenefitsCard } from "./sections/BenefitsCard";
import { SummaryStats } from "./sections/SummaryStats";
import { PlanSummaryCard } from "./sections/PlanSummaryCard";
import { RecentClaimsCard } from "./sections/RecentClaimsCard";
import { UpcomingConsultationCard } from "./sections/UpcomingConsultationCard";
import { QuickActionsCard } from "./sections/QuickActionsCard";
import { BenefitInfoDialog } from "./dialogs/BenefitInfoDialog";

// One component per card lives under ./sections (plus the benefit dialog
// under ./dialogs) - this file only owns the five data fetches and the
// derived numbers each card is handed.
export function Dashboard() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [claims, setClaims] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBenefit, setSelectedBenefit] = useState(null);

    // Everything the dashboard needs lives on five separate endpoints, so
    // they're fetched together and the page waits for all five before
    // rendering, rather than showing partial data as each one resolves.
    useEffect(() => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API_URL}/auth/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/policies/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/claims/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/consultations/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/policies/me/benefits`, { headers }).then((response) => response.json()),
        ])
            .then(([userData, policyData, claimsData, consultationsData, benefitsData]) => {
                setCurrentUser(userData);
                setPolicy(policyData);
                setClaims(claimsData);
                setConsultations(consultationsData);
                setBenefits(Array.isArray(benefitsData) ? benefitsData : []);
            })
            .catch(() =>
                setError(
                    "We couldn't load your dashboard right now. Please try again later.",
                ),
            )
            .finally(() => setLoading(false));
    }, [userId]);

    // Loading spinner while the Promise.all above is still in flight.
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

    // Plan details (price, features) come from static mock data keyed by
    // the plan id on the policy - the backend only stores the id.
    const plan = PLANS.find((p) => p.id === policy.planId);

    if (policy.status === "pending") {
        return (
            <BuildPolicyPrompt
                firstName={currentUser.firstName}
                planName={plan?.name}
                navigate={navigate}
            />
        );
    }

    // -1 is the backend's convention for "unlimited" consultations
    // (the Ultimate plan), so it needs its own display case rather than
    // showing "3/-1".
    const unlimitedConsultations = policy.consultationsIncluded === -1;
    const upcomingConsultation = consultations.find(
        (c) => c.status === "scheduled",
    );
    const openClaims = claims.filter(
        (claim) => claim.status === "pending" || claim.status === "in-review",
    ).length;
    // Defensive fallback for a policy somehow carrying no cover limit at
    // all, which would otherwise divide by zero - every plan tier has a
    // real limit today, so this shouldn't normally trigger.
    const coverUsedLabel =
        policy.coverLimit > 0
            ? `${Math.round((policy.coverUsed / policy.coverLimit) * 100)}%`
            : "-";

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Welcome back, {currentUser.firstName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Here's an overview of your legal cover.
            </Typography>

            <BenefitsCard
                benefits={benefits}
                onSelectBenefit={setSelectedBenefit}
            />

            <SummaryStats
                policy={policy}
                openClaims={openClaims}
                coverUsedLabel={coverUsedLabel}
                unlimitedConsultations={unlimitedConsultations}
            />

            <PlanSummaryCard policy={policy} plan={plan} navigate={navigate} />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <RecentClaimsCard claims={claims} navigate={navigate} />
                <UpcomingConsultationCard
                    upcomingConsultation={upcomingConsultation}
                    navigate={navigate}
                />
            </Box>

            <QuickActionsCard navigate={navigate} />

            <BenefitInfoDialog
                benefit={selectedBenefit}
                onClose={() => setSelectedBenefit(null)}
                navigate={navigate}
            />
        </Box>
    );
}
