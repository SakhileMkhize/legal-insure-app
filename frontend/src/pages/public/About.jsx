import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { StatCard } from "../../components/common/StatCard";
import PeopleIcon from "@mui/icons-material/People";
import GavelIcon from "@mui/icons-material/Gavel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "../../App.css";

// Static "what we stand for" cards.
const VALUES = [
    {
        icon: <VerifiedIcon />,
        title: "Integrity",
        body: "We're upfront about what's covered, and what isn't.",
    },
    {
        icon: <AccessibilityNewIcon />,
        title: "Accessibility",
        body: "Legal help shouldn't be reserved for those who can afford an attorney on retainer.",
    },
    {
        icon: <SchoolIcon />,
        title: "Expertise",
        body: "Every plan is backed by a vetted network of qualified attorneys.",
    },
    {
        icon: <VisibilityIcon />,
        title: "Transparency",
        body: "Clear policy wording, no fine-print surprises.",
    },
];

export function About() {
    const navigate = useNavigate();

    return (
        <Box>
            <Box className="hero-band" sx={{ py: 8 }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 2 }}
                    >
                        Our mission
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            maxWidth: 700,
                            color: "rgba(255,255,255,0.85)",
                        }}
                    >
                        What medical aid did for healthcare, we're building for
                        legal protection , affordable, everyday access to legal
                        guidance and representation for every household.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Our story
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 800, mb: 2 }}
                >
                    Most people don't need a lawyer every day , but when they
                    do, they often don't know who to call, can't afford the
                    fees, and act too late. LegalInsure was founded to close
                    that gap: combining AI-driven legal guidance, ready-to-use
                    legal documents, and a vetted network of attorneys into one
                    affordable monthly plan.
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 800 }}
                >
                    We work alongside South Africa's existing legal and
                    insurance ecosystem to make sure that when a dispute does
                    arise , a labour issue, a consumer complaint, a property
                    disagreement , our members have real support, not just a
                    helpline number.
                </Typography>
            </Container>

            <Box
                sx={{
                    bgcolor: "background.paper",
                    py: 8,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h4" align="center" sx={{ mb: 5 }}>
                        What we stand for
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 3,
                            justifyContent: "center",
                        }}
                    >
                        {VALUES.map((value) => (
                            <Card
                                key={value.title}
                                variant="outlined"
                                sx={{ flex: "1 1 220px", maxWidth: 260 }}
                            >
                                <CardContent sx={{ textAlign: "center" }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "primary.main",
                                            color: "secondary.main",
                                            mx: "auto",
                                            mb: 1.5,
                                        }}
                                    >
                                        {value.icon}
                                    </Avatar>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 700, mb: 0.5 }}
                                    >
                                        {value.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {value.body}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Marketing headline figures — hardcoded copy, not fetched
                from any real usage data. */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                    }}
                >
                    <StatCard
                        icon={<CalendarMonthIcon />}
                        label="Years protecting clients"
                        value="8+"
                    />
                    <StatCard
                        icon={<PeopleIcon />}
                        label="Clients protected"
                        value="42,000+"
                        accent="secondary"
                    />
                    <StatCard
                        icon={<GavelIcon />}
                        label="Claims resolved"
                        value="9,600+"
                    />
                    <StatCard
                        icon={<EventAvailableIcon />}
                        label="Attorneys in network"
                        value="350+"
                        accent="secondary"
                    />
                </Box>
            </Container>

            <Box className="cta-band" sx={{ py: 8 }}>
                <Container maxWidth="lg" sx={{ textAlign: "center" }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        Ready to get protected?
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
        </Box>
    );
}
