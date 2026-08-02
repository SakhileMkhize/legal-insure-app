import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/HighlightOff";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PlanCard } from "../../components/common/PlanCard";
import * as policyService from "../../services/policyService";

const COMPARISON_ROWS = [
    {
        label: "24/7 AI legal guidance",
        basic: true,
        premium: true,
        ultimate: true,
    },
    {
        label: "Legal document templates",
        basic: true,
        premium: true,
        ultimate: true,
    },
    {
        label: "Lawyer consultations",
        basic: false,
        premium: "2 / month",
        ultimate: "Unlimited",
    },
    {
        label: "Contract review by an attorney",
        basic: false,
        premium: true,
        ultimate: true,
    },
    {
        label: "Legal expense cover",
        basic: false,
        premium: false,
        ultimate: "Up to R500,000",
    },
    {
        label: "Court representation support",
        basic: false,
        premium: false,
        ultimate: true,
    },
];

const FAQS = [
    {
        question: "How does the claims process work?",
        answer: "Submit a claim from your dashboard with a short description and category. Our team reviews it, usually within 3-5 business days, and you'll see the status update on your claim in real time.",
    },
    {
        question: "Is there a waiting period before I can claim?",
        answer: "Basic and Premium plans have no waiting period for advice services. Legal expense cover under the Ultimate plan has a 30-day waiting period for new disputes, in line with standard legal insurance practice.",
    },
    {
        question: "Can I cancel or change my plan at any time?",
        answer: "Yes. You can upgrade, downgrade, or cancel your plan from your account settings at any time, effective from your next billing date.",
    },
    {
        question: "Who is eligible to sign up?",
        answer: "Any South African resident over the age of 18 can sign up as an individual. Business and employer group plans are available on request.",
    },
];

function ComparisonCell({ value }) {
    if (value === true)
        return <CheckCircleIcon color="success" fontSize="small" />;
    if (value === false)
        return <RemoveCircleOutlineIcon color="disabled" fontSize="small" />;
    return <Typography variant="body2">{value}</Typography>;
}

export function Plans() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        policyService
            .listPlans()
            .then(setPlans)
            .catch(() =>
                setError(
                    "We couldn't load our plans right now. Please try again later.",
                ),
            )
            .finally(() => setLoading(false));
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 2 }}
                >
                    Plans & Pricing
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 640, mx: "auto" }}
                >
                    Straightforward monthly pricing with no hidden fees.
                    Upgrade, downgrade, or cancel at any time.
                </Typography>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
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
                        mb: 8,
                    }}
                >
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onSelect={() => navigate(`/signup?plan=${plan.id}`)}
                            actionLabel="Choose Plan"
                        />
                    ))}
                </Box>
            )}

            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                Compare features
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 8 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>
                                Feature
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                                Basic
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                                Premium
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                                Ultimate
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {COMPARISON_ROWS.map((row) => (
                            <TableRow key={row.label}>
                                <TableCell>{row.label}</TableCell>
                                <TableCell align="center">
                                    <ComparisonCell value={row.basic} />
                                </TableCell>
                                <TableCell align="center">
                                    <ComparisonCell value={row.premium} />
                                </TableCell>
                                <TableCell align="center">
                                    <ComparisonCell value={row.ultimate} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                Frequently asked questions
            </Typography>
            <Box sx={{ maxWidth: 760, mx: "auto" }}>
                {FAQS.map((faq) => (
                    <Accordion key={faq.question} variant="outlined">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600 }}>
                                {faq.question}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">
                                {faq.answer}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Container>
    );
}
