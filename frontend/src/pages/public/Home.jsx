import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import PhoneIcon from "@mui/icons-material/Phone";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { CategoryIcon } from "../../components/common/CategoryIcon";
import { PlanCard } from "../../components/common/PlanCard";
import * as policyService from "../../services/policyService";
import teamConsultationImg from "../../assets/team-consultation.jpg";
import "../../App.css";

const callRequestSchema = yup.object({
    name: yup.string().trim().required("Name is required"),
    phone: yup.string().trim().required("Phone number is required"),
});

const VALUE_PROPS = [
    {
        icon: <GavelIcon />,
        title: "Real Legal Cover",
        body: "Legal expense cover for labour, consumer, civil, and property disputes.",
    },
    {
        icon: <AccessTimeIcon />,
        title: "Always Available",
        body: "24/7 AI legal guidance, so you know your rights before you act.",
    },
    {
        icon: <SupportAgentIcon />,
        title: "Human Lawyers",
        body: "Escalate to a qualified attorney whenever you need one.",
    },
    {
        icon: <VerifiedUserIcon />,
        title: "Trusted Protection",
        body: "Transparent plans with no hidden exclusions or surprise costs.",
    },
];

const TESTIMONIALS = [
    {
        name: "Thandeka M.",
        quote: "I got advice on an unfair dismissal within minutes instead of waiting weeks for an attorney.",
    },
    {
        name: "Johan v.d.M.",
        quote: "The document templates alone are worth the monthly premium.",
    },
    {
        name: "Naledi K.",
        quote: "My Ultimate plan covered a property dispute that would have cost me a fortune privately.",
    },
];

export function Home() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [callDialogOpen, setCallDialogOpen] = useState(false);
    const [callRequestSent, setCallRequestSent] = useState(false);

    useEffect(() => {
        policyService
            .listPlans()
            .then(setPlans)
            .catch(() => setError("We couldn't load our plans right now."))
            .finally(() => setLoading(false));
    }, []);

    const callRequestFormik = useFormik({
        initialValues: { name: "", phone: "" },
        validationSchema: callRequestSchema,
        onSubmit: (values, { resetForm }) => {
            setCallRequestSent(true);
            resetForm();
        },
    });

    const closeCallDialog = () => {
        setCallDialogOpen(false);
        setCallRequestSent(false);
    };

    return (
        <Box>
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
                                AI-powered legal guidance, document automation,
                                and lawyer access , plus legal expense cover
                                when things escalate.
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap: "wrap",
                                }}
                            >
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

            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" align="center" sx={{ mb: 1 }}>
                    Why legal cover matters
                </Typography>
                <Typography
                    variant="body1"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 5, maxWidth: 640, mx: "auto" }}
                >
                    A single consultation with an attorney can cost more than
                    months of legal cover premiums.
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                    }}
                >
                    {VALUE_PROPS.map((item) => (
                        <Card
                            key={item.title}
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
                                    {item.icon}
                                </Avatar>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700, mb: 0.5 }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {item.body}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
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
                        Cover across every dispute category
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 3,
                            justifyContent: "center",
                        }}
                    >
                        {COVER_CATEGORIES.map((category) => (
                            <Card
                                key={category.id}
                                variant="outlined"
                                sx={{ flex: "1 1 260px", maxWidth: 300 }}
                            >
                                <CardContent sx={{ display: "flex", gap: 2 }}>
                                    <CategoryIcon
                                        name={category.icon}
                                        color="primary"
                                    />
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {category.label}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {category.description}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" align="center" sx={{ mb: 5 }}>
                    Choose your plan
                </Typography>

                {loading && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                {!loading && error && <Alert severity="error">{error}</Alert>}
                {!loading && !error && (
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 3,
                            justifyContent: "center",
                        }}
                    >
                        {plans.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} compact />
                        ))}
                    </Box>
                )}
                <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Button variant="text" onClick={() => navigate("/plans")}>
                        Compare all plan features
                    </Button>
                </Box>
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
                        Trusted by our members
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 3,
                            justifyContent: "center",
                        }}
                    >
                        {TESTIMONIALS.map((testimonial) => (
                            <Card
                                key={testimonial.name}
                                variant="outlined"
                                sx={{ flex: "1 1 280px", maxWidth: 340 }}
                            >
                                <CardContent>
                                    <FormatQuoteIcon
                                        color="secondary"
                                        sx={{ fontSize: 32, mb: 1 }}
                                    />
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {testimonial.quote}
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {testimonial.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

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
                    Request a call and one of our advisors will phone you back
                    to help you choose the right cover.
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<PhoneIcon />}
                    onClick={() => setCallDialogOpen(true)}
                >
                    Request a Call
                </Button>
            </Container>

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

            <Dialog open={callDialogOpen} onClose={closeCallDialog} fullWidth maxWidth="xs">
                <DialogTitle>Request a Call</DialogTitle>
                <Box component="form" onSubmit={callRequestFormik.handleSubmit} noValidate>
                    <DialogContent>
                        {callRequestSent ? (
                            <Alert severity="success">
                                Thanks — an advisor will call you back shortly.
                            </Alert>
                        ) : (
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Full Name"
                                    name="name"
                                    value={callRequestFormik.values.name}
                                    onChange={callRequestFormik.handleChange}
                                    onBlur={callRequestFormik.handleBlur}
                                    error={
                                        callRequestFormik.touched.name &&
                                        Boolean(callRequestFormik.errors.name)
                                    }
                                    helperText={
                                        callRequestFormik.touched.name &&
                                        callRequestFormik.errors.name
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="Phone Number"
                                    name="phone"
                                    value={callRequestFormik.values.phone}
                                    onChange={callRequestFormik.handleChange}
                                    onBlur={callRequestFormik.handleBlur}
                                    error={
                                        callRequestFormik.touched.phone &&
                                        Boolean(callRequestFormik.errors.phone)
                                    }
                                    helperText={
                                        callRequestFormik.touched.phone &&
                                        callRequestFormik.errors.phone
                                    }
                                    fullWidth
                                />
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button onClick={closeCallDialog}>
                            {callRequestSent ? "Close" : "Cancel"}
                        </Button>
                        {!callRequestSent && (
                            <Button type="submit" variant="contained" color="secondary">
                                Request Call
                            </Button>
                        )}
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
