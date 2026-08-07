import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChatIcon from "@mui/icons-material/Chat";
import ArticleIcon from "@mui/icons-material/Article";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { StatusChip } from "../../components/common/StatusChip";
import { PLANS } from "../../data/mockPlans";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { API_URL } from "../../../global";

export function Dashboard() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [claims, setClaims] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        ])
            .then(([userData, policyData, claimsData, consultationsData]) => {
                setCurrentUser(userData);
                setPolicy(policyData);
                setClaims(claimsData);
                setConsultations(consultationsData);
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

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Welcome back, {currentUser.firstName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Here's an overview of your legal cover.
            </Typography>

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
                                label={`R${policy.monthlyPremium}/mo`}
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
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/plans")}
                        >
                            Manage Plan
                        </Button>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Typography variant="overline" color="text.secondary">
                            Cover Usage
                        </Typography>
                        {policy.coverLimit > 0 ? (
                            <>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    R{policy.coverUsed.toLocaleString()} used of
                                    R{policy.coverLimit.toLocaleString()}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        (policy.coverUsed / policy.coverLimit) *
                                        100
                                    }
                                    color="secondary"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </>
                        ) : (
                            <Alert
                                severity="info"
                                variant="outlined"
                                sx={{ mt: 1 }}
                            >
                                Legal expense cover is available on the Ultimate
                                plan.
                                <Button
                                    size="small"
                                    sx={{ ml: 1 }}
                                    onClick={() => navigate("/plans")}
                                >
                                    Upgrade
                                </Button>
                            </Alert>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Consultations used: {policy.consultationsUsed}
                            {unlimitedConsultations
                                ? " (unlimited plan)"
                                : ` of ${policy.consultationsIncluded}`}
                        </Typography>
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
                        <Stack spacing={1.5}>
                            {claims.slice(0, 3).map((claim) => (
                                <Stack
                                    key={claim.id}
                                    direction="row"
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
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
                            disabled
                        >
                            Download Documents
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
