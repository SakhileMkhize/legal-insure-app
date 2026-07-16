import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";

const STEP_PATHS = ["/signup/details", "/signup/plan", "/signup/account", "/signup/confirmation"];
const STEP_LABELS = ["Your Details", "Choose Plan", "Create Account", "Done"];

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

  const updateFormData = (updates) => setFormData((prev) => ({ ...prev, ...updates }));

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
