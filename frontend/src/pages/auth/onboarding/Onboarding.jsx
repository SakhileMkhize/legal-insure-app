import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";

// Kept in the same order as the nested routes under /signup in App.jsx -
// index position doubles as the step number for the Stepper below.
const STEP_PATHS = [
    "/signup/details",
    "/signup/plan",
    "/signup/account",
    "/signup/confirmation",
];
const STEP_LABELS = ["Your Details", "Choose Plan", "Create Account", "Done"];

// Layout route for the whole signup flow: renders the shared Stepper
// header, then whichever step page matched via the nested <Outlet>. The
// four step pages don't manage their own state - they all read and write
// the same formData object here, passed down through the Outlet's
// context and picked up on each page with useOutletContext.
export function Onboarding() {
    const location = useLocation();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        planId: "",
        password: "",
    });

    const updateFormData = (updates) =>
        setFormData((prev) => ({ ...prev, ...updates }));

    // Matches the current URL against STEP_PATHS to know which Stepper
    // step to highlight; falls back to step 0 if nothing matches.
    const activeStep = Math.max(0, STEP_PATHS.indexOf(location.pathname));

    return (
        <Box>
            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {STEP_LABELS.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Outlet context={{ formData, updateFormData }} />
        </Box>
    );
}
