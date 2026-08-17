import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChatIcon from "@mui/icons-material/Chat";
import ArticleIcon from "@mui/icons-material/Article";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PaidIcon from "@mui/icons-material/Paid";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShieldIcon from "@mui/icons-material/Shield";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import { StatCard } from "../../components/common/StatCard";
import { StatusChip } from "../../components/common/StatusChip";
import { PLANS } from "../../data/mockPlans";
import { CATEGORY_MAP } from "../../utils/categoryMap";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { API_URL } from "../../../global";

// Maps each benefit id (returned by the API) to the icon shown in its badge.
const BENEFIT_ICONS = {
    "will-estate": GavelIcon,
    "traffic-fines": DirectionsCarIcon,
    "pre-claim-consult": SupportAgentIcon,
    "identity-theft": ShieldIcon,
};

// Where the "More Info" dialog's call-to-action button should navigate,
// per benefit — service benefits point at booking a consultation, the
// two money-limited ones point at submitting a claim.
const BENEFIT_ACTIONS = {
    "will-estate": { label: "Book a Consultation", path: "/consultations" },
    "traffic-fines": { label: "Submit a Claim", path: "/claims" },
    "pre-claim-consult": { label: "Book a Consultation", path: "/consultations" },
    "identity-theft": { label: "Submit a Claim", path: "/claims" },
};

// Turns a benefit's raw usage numbers into a short status label + chip
// color. Benefits with no usageLimitCount (unlimited) only ever read as
// "Used" or "Available"; limited ones distinguish partial vs full use.
function getBenefitStatus(benefit) {
    const { usageLimitCount, usedCount } = benefit;
    if (usageLimitCount == null) {
        return usedCount > 0
            ? { label: "Used", color: "default" }
            : { label: "Available", color: "success" };
    }
    if (usedCount >= usageLimitCount) {
        return { label: "Fully used", color: "default" };
    }
    if (usedCount > 0) {
        return { label: "Partially used", color: "warning" };
    }
    return { label: "Available", color: "success" };
}

// Builds the longer, plain-language sentence shown inside the "More Info"
// dialog (e.g. "Used 1 of 2 covered uses this year. R350 of a R1,000
// annual limit claimed.").
function getBenefitUsageSummary(benefit) {
    const { usageLimitCount, usedCount, usageLimitAmount, usedAmount } =
        benefit;
    if (usageLimitCount == null) {
        return usedCount > 0
            ? "You've used this benefit."
            : "You haven't used this benefit yet.";
    }
    let summary = `You've used ${usedCount} of ${usageLimitCount} covered ${
        usageLimitCount === 1 ? "use" : "uses"
    } this year.`;
    if (usageLimitAmount != null) {
        summary += ` R${usedAmount.toLocaleString()} of a R${usageLimitAmount.toLocaleString()} annual limit claimed.`;
    }
    return summary;
}

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
    // the plan id on the policy — the backend only stores the id.
    const plan = PLANS.find((p) => p.id === policy.planId);

    // A brand-new signup has a policy but hasn't gone through underwriting
    // yet, so the full dashboard (claims, benefits, cover usage) wouldn't
    // mean anything — a short prompt to finish onboarding is shown instead.
    if (policy.status === "pending") {
        return (
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Hello, {currentUser.firstName}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Here's an overview of your legal cover.
                </Typography>

                <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 6 }}>
                        <PendingActionsIcon
                            color="secondary"
                            sx={{ fontSize: 48, mb: 2 }}
                        />
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mb: 1 }}
                        >
                            We're building your policy
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 3, maxWidth: 480, mx: "auto" }}
                        >
                            Thanks for signing up, {currentUser.firstName}.
                            Our team will be in touch within 24 hours
                            to set up your {plan?.name} cover.

                            Or you can do it yourself right now
                            and get covered immediately.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => navigate("/dashboard/build-policy")}
                        >
                            Do It Yourself
                        </Button>
                    </CardContent>
                </Card>
            </Box>
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
    // Basic/Premium have no monetary cover limit at all, so the percentage
    // would divide by zero — shown as a dash instead.
    const coverUsedLabel =
        policy.coverLimit > 0
            ? `${Math.round((policy.coverUsed / policy.coverLimit) * 100)}%`
            : "-";

    return (
        <Box>
            {/* Page greeting */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Welcome back, {currentUser.firstName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Here's an overview of your legal cover.
            </Typography>

            {/* Benefits card — one row per perk, with a status chip and a
                "More Info" button that opens the dialog further down. */}
            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                        Your Benefits
                    </Typography>
                    <Stack divider={<Divider />} spacing={1.5}>
                        {benefits.map((benefit) => {
                            const Icon = BENEFIT_ICONS[benefit.id] ?? GavelIcon;
                            const status = getBenefitStatus(benefit);
                            return (
                                <Stack
                                    key={benefit.id}
                                    direction="row"
                                    spacing={{ xs: 1.5, sm: 2 }}
                                    sx={{
                                        alignItems: "center",
                                        py: 0.5,
                                        flexWrap: "wrap",
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1.5,
                                            bgcolor: "secondary.light",
                                            color: "secondary.dark",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon fontSize="small" />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 180 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {benefit.label}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {benefit.usageLimitCount === 1
                                                ? status.label
                                                : benefit.usageLimitCount !=
                                                    null
                                                  ? `${benefit.usedCount} of ${benefit.usageLimitCount} used`
                                                  : status.label}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        size="small"
                                        label={status.label}
                                        color={
                                            status.color === "default"
                                                ? undefined
                                                : status.color
                                        }
                                        variant={
                                            status.color === "success"
                                                ? "outlined"
                                                : "filled"
                                        }
                                    />
                                    <Button
                                        size="small"
                                        startIcon={
                                            <InfoOutlinedIcon fontSize="small" />
                                        }
                                        onClick={() =>
                                            setSelectedBenefit(benefit)
                                        }
                                    >
                                        More Info
                                    </Button>
                                </Stack>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>

            {/* Four glanceable numbers summarizing the account at a
                whole-page level; StatCard is the shared icon+value tile
                also used on the Admin Dashboard. */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <StatCard
                    icon={<PaidIcon />}
                    label="Monthly Premium"
                    value={`R${policy.monthlyPremium}`}
                />
                <StatCard
                    icon={<DonutLargeIcon />}
                    label="Cover Used"
                    value={coverUsedLabel}
                    accent="secondary"
                />
                <StatCard
                    icon={<EventAvailableIcon />}
                    label="Consultations Used"
                    value={
                        unlimitedConsultations
                            ? policy.consultationsUsed
                            : `${policy.consultationsUsed}/${policy.consultationsIncluded}`
                    }
                />
                <StatCard
                    icon={<PendingActionsIcon />}
                    label="Open Claims"
                    value={openClaims}
                    accent="secondary"
                />
            </Box>

            {/* "Your Plan" card: plan name/price, cover categories, and
                the policy-identity/POPIA-consent footer strip. */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                >
                                    Your Plan
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {plan?.name}
                                </Typography>
                            </Box>
                            <Chip
                                label={`R${policy.monthlyPremium}/month`}
                                color="secondary"
                            />
                        </Stack>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Active since {formatDate(policy.startDate)}
                        </Typography>

                        {/* Category chips only appear once cover has
                            actually been configured for this policy. */}
                        {policy.categoriesCovered?.length > 0 && (
                            <Stack
                                direction="row"
                                spacing={0.75}
                                sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.5 }}
                            >
                                {policy.categoriesCovered.map((categoryId) => (
                                    <Chip
                                        key={categoryId}
                                        label={
                                            CATEGORY_MAP[categoryId]?.label ??
                                            categoryId
                                        }
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: "center" }}
                            >
                                <VerifiedUserIcon
                                    fontSize="inherit"
                                    color={
                                        policy.popiaConsent
                                            ? "success"
                                            : "disabled"
                                    }
                                />
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Policy {policy.id.slice(0, 8).toUpperCase()}{" "}
                                    · POPIA consent{" "}
                                    {policy.popiaConsent
                                        ? "confirmed"
                                        : "pending"}
                                </Typography>
                            </Stack>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate("/plans")}
                            >
                                Manage Plan
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* Recent Claims (left) and Upcoming Consultation (right) — a
                short preview of each, with a link through to the full
                page for either. */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                            >
                                Recent Claims
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => navigate("/claims")}
                            >
                                View all
                            </Button>
                        </Stack>
                        {claims.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                You haven't submitted any claims yet.
                            </Typography>
                        )}
                        {/* Only the 3 most recent claims — the rest live
                            on the full Claims page behind "View all". */}
                        <Stack spacing={0.5}>
                            {claims.slice(0, 3).map((claim) => (
                                <Stack
                                    key={claim.id}
                                    direction="row"
                                    onClick={() => navigate("/claims")}
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 1,
                                        mx: -1,
                                        borderRadius: 1.5,
                                        cursor: "pointer",
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
                                            noWrap
                                        >
                                            {claim.title}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {formatDate(claim.submittedAt)}
                                        </Typography>
                                    </Box>
                                    <StatusChip status={claim.status} />
                                </Stack>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 1 }}
                        >
                            Upcoming Consultation
                        </Typography>
                        {upcomingConsultation ? (
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                >
                                    {upcomingConsultation.lawyerName}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {formatDateTime(
                                        upcomingConsultation.scheduledAt,
                                    )}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No upcoming consultations.
                            </Typography>
                        )}
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/consultations")}
                        >
                            Book Consultation
                        </Button>
                    </CardContent>
                </Card>
            </Box>

            {/* Quick Actions — shortcuts to the same destinations reachable
                elsewhere in the app, plus the policy-summary download and
                a still-unbuilt "Ask AI Assistant" placeholder (disabled). */}
            <Card variant="outlined">
                <CardContent>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 2 }}
                    >
                        Quick Actions
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<DescriptionIcon />}
                            onClick={() => navigate("/claims")}
                        >
                            Submit a Claim
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<EventAvailableIcon />}
                            onClick={() => navigate("/consultations")}
                        >
                            Book Consultation
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ChatIcon />}
                            disabled
                        >
                            Ask AI Assistant
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ArticleIcon />}
                            disabled
                        >
                            Download Policy Summary
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* "More Info" dialog for whichever benefit was clicked.
                selectedBenefit doubles as both the open/closed flag and the
                data source, so there's no separate boolean to keep in sync. */}
            <Dialog
                open={Boolean(selectedBenefit)}
                onClose={() => setSelectedBenefit(null)}
                fullWidth
                maxWidth="sm"
            >
                {selectedBenefit && (
                    <>
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            {selectedBenefit.label}
                            <IconButton
                                size="small"
                                onClick={() => setSelectedBenefit(null)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {selectedBenefit.description}
                            </Typography>
                            <Alert
                                severity={
                                    getBenefitStatus(selectedBenefit)
                                        .color === "success"
                                        ? "success"
                                        : "info"
                                }
                                variant="outlined"
                            >
                                {getBenefitUsageSummary(selectedBenefit)}
                            </Alert>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 1 }}>
                            <Button onClick={() => setSelectedBenefit(null)}>
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => {
                                    const action =
                                        BENEFIT_ACTIONS[selectedBenefit.id];
                                    setSelectedBenefit(null);
                                    if (action) navigate(action.path);
                                }}
                            >
                                {BENEFIT_ACTIONS[selectedBenefit.id]?.label ??
                                    "Get Started"}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
