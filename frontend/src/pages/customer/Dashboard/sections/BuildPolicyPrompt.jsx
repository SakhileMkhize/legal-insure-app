import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

// A brand-new signup has a policy but hasn't gone through underwriting yet,
// so the full dashboard (claims, benefits, cover usage) wouldn't mean
// anything — this short prompt to finish onboarding is shown instead.
export function BuildPolicyPrompt({ firstName, planName, navigate }) {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Hello, {firstName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Here's an overview of your legal cover.
            </Typography>

            <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                    <PendingActionsIcon
                        color="secondary"
                        sx={{ fontSize: 48, mb: 2 }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        We're building your policy
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3, maxWidth: 480, mx: "auto" }}
                    >
                        Thanks for signing up, {firstName}. Our team will be in
                        touch within 24 hours to set up your {planName} cover.
                        Or you can do it yourself right now and get covered
                        immediately.
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
