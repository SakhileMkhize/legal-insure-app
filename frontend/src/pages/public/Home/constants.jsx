import * as yup from "yup";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

// Validation for the "Request a Call" dialog form.
export const callRequestSchema = yup.object({
    name: yup.string().trim().required("Name is required"),
    phone: yup.string().trim().required("Phone number is required"),
});

// Static marketing content for the page's card grids - none of this is
// fetched, since it's the same for every visitor.
export const VALUE_PROPS = [
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

export const TESTIMONIALS = [
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
