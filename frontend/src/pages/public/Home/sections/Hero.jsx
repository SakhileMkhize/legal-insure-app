import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import teamConsultationImg from "../../../../assets/team-consultation.jpg";

// Headline, CTA buttons, and a hero image - the "hero-band" class comes
// from App.css, imported once by the parent page.
export function Hero({ navigate }) {
    return (
        <Box className="hero-band" sx={{ py: { xs: 8, md: 12 } }}>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "center",
                        gap: { xs: 5, md: 6 },
                    }}
                >
                    <Box sx={{ maxWidth: 640, flex: 1 }}>
                        <Typography
                            variant="h2"
                            sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 2 }}
                        >
                            Legal protection for life's disputes
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 400,
                                mb: 4,
                                color: "rgba(255,255,255,0.85)",
                            }}
                        >
                            AI-powered legal guidance, document automation, and
                            lawyer access , plus legal expense cover when
                            things escalate.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                onClick={() => navigate("/signup")}
                            >
                                Get Covered
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    color: "#fff",
                                    borderColor: "rgba(255,255,255,0.5)",
                                }}
                                onClick={() => navigate("/plans")}
                            >
                                See Plans
                            </Button>
                        </Box>
                    </Box>

                    <Box
                        component="img"
                        src={teamConsultationImg}
                        alt="Clients reviewing their legal cover with a LegalInsure advisor"
                        sx={{
                            flex: 1,
                            width: "100%",
                            maxWidth: 480,
                            borderRadius: 3,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                            display: "block",
                        }}
                    />
                </Box>
            </Container>
        </Box>
    );
}
