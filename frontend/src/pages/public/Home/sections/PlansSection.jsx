import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { PlanCard } from "../../../../components/common/PlanCard";
import { PLANS } from "../../../../data/mockPlans";

// Plan cards, in "compact" mode - the full comparison lives on the
// dedicated Plans page linked below the grid.
export function PlansSection({ navigate }) {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h4" align="center" sx={{ mb: 5 }}>
                Choose your plan
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: "center",
                }}
            >
                {PLANS.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} compact />
                ))}
            </Box>
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button variant="text" onClick={() => navigate("/plans")}>
                    Compare all plan features
                </Button>
            </Box>
        </Container>
    );
}
