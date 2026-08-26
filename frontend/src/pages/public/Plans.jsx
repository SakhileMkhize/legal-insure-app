import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PlanCard } from "../../components/common/PlanCard";
import { PLANS } from "../../data/mockPlans";

// Static FAQ content for the accordion below.
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

export function Plans() {
    const navigate = useNavigate();

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

            {/* Full-size plan cards - selecting one sends the plan id
                along as a query param, picked up by SignupPlanSelection
                to preselect it in the signup wizard. */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: "center",
                    mb: 8,
                }}
            >
                {PLANS.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={() => navigate(`/signup?plan=${plan.id}`)}
                        actionLabel="Choose Plan"
                    />
                ))}
            </Box>

            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                Frequently asked questions
            </Typography>
            {/* Collapsible FAQ list - one Accordion per question, all
                independently expandable. */}
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
