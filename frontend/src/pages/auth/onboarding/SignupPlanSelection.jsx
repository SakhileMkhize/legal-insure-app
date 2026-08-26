import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { PlanCard } from "../../../components/common/PlanCard";
import { PLANS } from "../../../data/mockPlans";

export function SignupPlanSelection() {
    const { formData, updateFormData } = useOutletContext();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // Preselects a plan from either the previous step's answer or a
    // ?plan= query param (arriving here from the marketing Plans page).
    const [selectedPlanId, setSelectedPlanId] = useState(
        formData.planId || searchParams.get("plan") || "",
    );

    // Guards against landing on this step directly (e.g. a bookmarked
    // URL) without having filled in step 1 first - formData.email being
    // empty means the wizard hasn't actually been started.
    useEffect(() => {
        if (!formData.email) {
            navigate("/signup/details", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = () => {
        updateFormData({ planId: selectedPlanId });
        navigate("/signup/account");
    };

    return (
        <Box>
            <Typography
                variant="h5"
                sx={{ fontWeight: 700, mb: 0.5, textAlign: "center" }}
            >
                Choose your plan
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, textAlign: "center" }}
            >
                You can change your plan at any time after you sign up.
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: "center",
                    mb: 4,
                }}
            >
                {PLANS.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        compact
                        selected={selectedPlanId === plan.id}
                        onSelect={setSelectedPlanId}
                    />
                ))}
            </Box>

            <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: "center" }}
            >
                <Button
                    variant="outlined"
                    onClick={() => navigate("/signup/details")}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={!selectedPlanId}
                    onClick={handleNext}
                >
                    Next
                </Button>
            </Stack>
        </Box>
    );
}
