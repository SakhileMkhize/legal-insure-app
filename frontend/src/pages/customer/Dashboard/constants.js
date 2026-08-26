import GavelIcon from "@mui/icons-material/Gavel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShieldIcon from "@mui/icons-material/Shield";

// Maps each benefit id (returned by the API) to the icon shown in its badge.
export const BENEFIT_ICONS = {
    "will-estate": GavelIcon,
    "traffic-fines": DirectionsCarIcon,
    "pre-claim-consult": SupportAgentIcon,
    "identity-theft": ShieldIcon,
};

// Where the "More Info" dialog's call-to-action button should navigate,
// per benefit - service benefits point at booking a consultation, the
// two money-limited ones point at submitting a claim.
export const BENEFIT_ACTIONS = {
    "will-estate": { label: "Book a Consultation", path: "/consultations" },
    "traffic-fines": { label: "Submit a Claim", path: "/claims" },
    "pre-claim-consult": { label: "Book a Consultation", path: "/consultations" },
    "identity-theft": { label: "Submit a Claim", path: "/claims" },
};

// Turns a benefit's raw usage numbers into a short status label + chip
// color. Benefits with no usageLimitCount (unlimited) only ever read as
// "Used" or "Available"; limited ones distinguish partial vs full use.
export function getBenefitStatus(benefit) {
    const { usageLimitCount, usedCount } = benefit;
    if (usageLimitCount == null) {
        return usedCount > 0
            ? { label: "Used", color: "default" }
            : { label: "Available", color: "success" };
    }
    if (usedCount >= usageLimitCount) {
        return { label: "Fully used", color: "default" };
    }
    if (usedCount > 0) {
        return { label: "Partially used", color: "warning" };
    }
    return { label: "Available", color: "success" };
}

// Builds the longer, plain-language sentence shown inside the "More Info"
// dialog (e.g. "Used 1 of 2 covered uses this year. R350 of a R1,000
// annual limit claimed.").
export function getBenefitUsageSummary(benefit) {
    const { usageLimitCount, usedCount, usageLimitAmount, usedAmount } = benefit;
    if (usageLimitCount == null) {
        return usedCount > 0
            ? "You've used this benefit."
            : "You haven't used this benefit yet.";
    }
    let summary = `You've used ${usedCount} of ${usageLimitCount} covered ${
        usageLimitCount === 1 ? "use" : "uses"
    } this year.`;
    if (usageLimitAmount != null) {
        summary += ` R${usedAmount.toLocaleString()} of a R${usageLimitAmount.toLocaleString()} annual limit claimed.`;
    }
    return summary;
}
