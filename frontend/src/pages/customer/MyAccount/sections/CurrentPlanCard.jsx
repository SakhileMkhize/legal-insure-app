import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

// Current plan name, price, and a shortcut to the Plans page - named
// "CurrentPlanCard" rather than "PlanCard" to avoid clashing with the
// shared components/common/PlanCard used elsewhere.
export function CurrentPlanCard({ plan, navigate }) {
    return (
        <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
            <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Current Plan
                </Typography>
                {plan && (
                    <>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {plan.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            R{plan.monthlyPrice}/month - {plan.tagline}
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
    );
}
