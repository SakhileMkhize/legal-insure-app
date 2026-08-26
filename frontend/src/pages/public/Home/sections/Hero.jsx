import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import teamConsultationImg from "../../../../assets/team-consultation.jpg";

// Full-bleed hero image with the headline/CTA overlaid on top - the photo
// sits as a darkened, absolutely-positioned layer filling the whole band
// rather than a separate framed photo sharing space with the text.
export function Hero({ navigate }) {
    return (
        <Box
            className="hero-band"
            sx={{
                position: "relative",
                py: { xs: 8, md: 12 },
                overflow: "hidden",
            }}
        >
            {/* Decorative only - the meaningful content is the text below,
                so this is hidden from assistive tech rather than described. */}
            <Box
                component="img"
                src={teamConsultationImg}
                alt=""
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.45)",
                }}
            />
            <Container maxWidth="lg" sx={{ position: "relative" }}>
                <Box sx={{ maxWidth: 640 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: "2.25rem", md: "3rem" },
                            mb: 2,
                        }}
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
                        lawyer access, plus legal expense cover when
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
            </Container>
        </Box>
    );
}
