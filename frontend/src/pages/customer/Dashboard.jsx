import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { alpha } from "@mui/material/styles";
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
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
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
import { downloadPolicySummary } from "../../utils/policySummary";
import { API_URL } from "../../../global";

const BENEFIT_ICONS = {
    "will-estate": GavelIcon,
    "traffic-fines": DirectionsCarIcon,
    "pre-claim-consult": SupportAgentIcon,
    "identity-theft": ShieldIcon,
};

// Fixed categorical order (blue/orange/aqua/yellow) validated for CVD-safe
// adjacent pairs — see dataviz skill's palette.md. Always paired with an
// icon + text label here, never relied on alone, since two of these four
// sit below 3:1 contrast against a plain page background.
const BENEFIT_COLORS = {
    "will-estate": "#2a78d6",
    "traffic-fines": "#eb6834",
    "pre-claim-consult": "#1baf7a",
    "identity-theft": "#eda100",
};

const BENEFIT_ACTIONS = {
    "will-estate": { label: "Book a Consultation", path: "/consultations" },
    "traffic-fines": { label: "Submit a Claim", path: "/claims" },
    "pre-claim-consult": { label: "Book a Consultation", path: "/consultations" },
    "identity-theft": { label: "Submit a Claim", path: "/claims" },
};

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

    const plan = PLANS.find((p) => p.id === policy.planId);

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

    const unlimitedConsultations = policy.consultationsIncluded === -1;
    const upcomingConsultation = consultations.find(
        (c) => c.status === "scheduled",
    );
    const openClaims = claims.filter(
        (claim) => claim.status === "pending" || claim.status === "in-review",
    ).length;
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

            <Card
                variant="outlined"
                sx={{
                    mb: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(
                        BENEFIT_COLORS["will-estate"],
                        0.06,
                    )} 0%, ${alpha(BENEFIT_COLORS["identity-theft"], 0.08)} 100%)`,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", mb: 0.5 }}
                    >
                        <CardGiftcardIcon color="secondary" />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Your Benefits
                        </Typography>
                    </Stack>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2.5 }}
                    >
                        Perks included with your cover — make the most of
                        them.
                    </Typography>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                            },
                            gap: 2,
                        }}
                    >
                        {benefits.map((benefit) => {
                            const Icon =
                                BENEFIT_ICONS[benefit.id] ?? GavelIcon;
                            const color =
                                BENEFIT_COLORS[benefit.id] ?? "#2a78d6";
                            const status = getBenefitStatus(benefit);
                            return (
                                <Box
                                    key={benefit.id}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(color, 0.1),
                                        border: "1px solid",
                                        borderColor: alpha(color, 0.3),
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                bgcolor: color,
                                                color: "#fff",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 700 }}
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
                                    </Stack>
                                    <Button
                                        size="small"
                                        sx={{
                                            alignSelf: "flex-start",
                                            color,
                                            "&:hover": {
                                                bgcolor: alpha(color, 0.12),
                                            },
                                        }}
                                        startIcon={
                                            <InfoOutlinedIcon fontSize="small" />
                                        }
                                        onClick={() =>
                                            setSelectedBenefit(benefit)
                                        }
                                    >
                                        More Info
                                    </Button>
                                </Box>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>

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
                            onClick={() =>
                                downloadPolicySummary({
                                    user: currentUser,
                                    policy,
                                    plan,
                                })
                            }
                        >
                            Download Policy Summary
                        </Button>
                    </Box>
                </CardContent>
            </Card>

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
