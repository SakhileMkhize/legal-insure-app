import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// Closing call-to-action banner - the "cta-band" class comes from
// App.css, imported once by the parent page.
export function ClosingBanner({ navigate }) {
    return (
        <Box className="cta-band" sx={{ py: 8 }}>
            <Container maxWidth="lg" sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Before you sign anything, consult your legal cover.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    sx={{
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                    }}
                    onClick={() => navigate("/signup")}
                >
                    Get Covered Today
                </Button>
            </Container>
        </Box>
    );
}
