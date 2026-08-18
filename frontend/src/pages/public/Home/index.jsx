import { useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import "../../../App.css";
import { Hero } from "./sections/Hero";
import { ValueProps } from "./sections/ValueProps";
import { CoverCategoriesSection } from "./sections/CoverCategoriesSection";
import { PlansSection } from "./sections/PlansSection";
import { Testimonials } from "./sections/Testimonials";
import { CallToActionPrompt } from "./sections/CallToActionPrompt";
import { ClosingBanner } from "./sections/ClosingBanner";
import { RequestCallDialog } from "./dialogs/RequestCallDialog";

// One component per marketing section lives under ./sections - this file
// only owns page order and the Request a Call dialog's open state.
export function Home() {
    const navigate = useNavigate();
    const [callDialogOpen, setCallDialogOpen] = useState(false);

    return (
        <Box>
            <Hero navigate={navigate} />
            <ValueProps />
            <CoverCategoriesSection />
            <PlansSection navigate={navigate} />
            <Testimonials />
            <CallToActionPrompt onRequestCall={() => setCallDialogOpen(true)} />
            <ClosingBanner navigate={navigate} />
            <RequestCallDialog
                open={callDialogOpen}
                onClose={() => setCallDialogOpen(false)}
            />
        </Box>
    );
}
