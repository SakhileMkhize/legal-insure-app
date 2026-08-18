import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import PhoneIcon from "@mui/icons-material/Phone";

// "Prefer to talk?" prompt - opens the Request a Call dialog in the parent.
export function CallToActionPrompt({ onRequestCall }) {
    return (
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
            <Avatar
                sx={{
                    bgcolor: "primary.main",
                    color: "secondary.main",
                    mx: "auto",
                    mb: 2,
                    width: 56,
                    height: 56,
                }}
            >
                <PhoneIcon />
            </Avatar>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Prefer to talk to someone?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Request a call and one of our advisors will phone you back to
                help you choose the right cover.
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<PhoneIcon />}
                onClick={onRequestCall}
            >
                Request a Call
            </Button>
        </Container>
    );
}
