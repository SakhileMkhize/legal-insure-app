import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { PLANS } from "../../../data/mockPlans";

export function SignupConfirmation() {
    const { formData } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!formData.email) {
            navigate("/signup/details", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const plan = PLANS.find((p) => p.id === formData.planId);

    return (
        <Card variant="outlined">
            <CardContent sx={{ p: 4, textAlign: "center" }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    You're covered, {formData.firstName}!
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Your account has been created and your {plan?.name} plan is
                    now active.
                </Typography>

                {plan && (
                    <Box
                        sx={{
                            display: "inline-block",
                            textAlign: "left",
                            bgcolor: "background.default",
                            borderRadius: 2,
                            p: 2.5,
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                        >
                            {plan.name} Plan , R{plan.monthlyPrice}/month
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {plan.tagline}
                        </Typography>
                    </Box>
                )}

                <Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => navigate("/dashboard")}
                    >
                        Go to Dashboard
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
