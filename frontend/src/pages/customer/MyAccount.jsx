import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import LogoutIcon from "@mui/icons-material/Logout";
import { PLANS } from "../../data/mockPlans";
import { formatDate } from "../../utils/formatDate";
import * as authService from "../../services/authService";
import * as policyService from "../../services/policyService";

export function MyAccount() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            authService.getUserById(userId),
            policyService.getPolicyForUser(userId),
        ])
            .then(([userData, policyData]) => {
                setCurrentUser(userData);
                setPolicy(policyData);
            })
            .catch(() => setError("We couldn't load your account right now."))
            .finally(() => setLoading(false));
    }, [userId]);

    const plan = policy ? PLANS.find((p) => p.id === policy.planId) : null;

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
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

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center", mb: 2 }}
                        >
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: "secondary.main",
                                    color: "primary.main",
                                    fontWeight: 700,
                                }}
                            >
                                {currentUser.firstName[0]}
                                {currentUser.lastName[0]}
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {currentUser.firstName}{" "}
                                    {currentUser.lastName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {currentUser.email}
                                </Typography>
                            </Box>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={1.5}>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Phone
                                </Typography>
                                <Typography variant="body2">
                                    {currentUser.phone}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Client since
                                </Typography>
                                <Typography variant="body2">
                                    {formatDate(currentUser.joinedAt)}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            sx={{ mt: 3 }}
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 2 }}
                        >
                            Current Plan
                        </Typography>
                        {plan && (
                            <>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {plan.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    R{plan.monthlyPrice}/month — {plan.tagline}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => navigate("/plans")}
                                >
                                    Change Plan
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
