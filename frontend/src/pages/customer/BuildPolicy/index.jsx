import { useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stack from "@mui/material/Stack";
import { API_URL } from "../../../../global";
import { STEP_LABELS } from "./constants";
import { AboutYouStep } from "./steps/AboutYouStep";
import { DependantsStep } from "./steps/DependantsStep";
import { CoverCategoriesStep } from "./steps/CoverCategoriesStep";
import { DisclosuresStep } from "./steps/DisclosuresStep";
import { ReviewStep } from "./steps/ReviewStep";

// One component per step lives under ./steps - this file only owns the
// shared formData, the stepper chrome, and submission, and hands each
// step just the slice of state (plus updateFormData) it needs.
export function BuildPolicy() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [formData, setFormData] = useState({
        dateOfBirth: "",
        idNumber: "",
        address: "",
        employerName: "",
        occupation: "",
        employmentStatus: "",
        maritalStatus: "",
        nextOfKin: [],
        dependants: [],
        categoriesCovered: [],
        hasPreExistingDispute: "no",
        preExistingDisputeDetails: "",
        personalUseConfirmed: false,
        popiaConsent: false,
    });
    // Shallow-merges partial updates into formData, so each field's
    // onChange only needs to pass the one key it's changing.
    const updateFormData = (updates) =>
        setFormData((prev) => ({ ...prev, ...updates }));

    // Whether "Next" is enabled for each step. Dependants (1) and Review
    // (4) have nothing mandatory; step 3 additionally requires disclosure
    // details once a pre-existing dispute has been declared. Employment and
    // next of kin stay optional throughout, same as on the account page.
    // Banking and legal history aren't collected here at all - those stay
    // My Account-only, added after the policy is active.
    const stepValid = {
        0: Boolean(
            formData.dateOfBirth && formData.idNumber && formData.address,
        ),
        1: true,
        2: formData.categoriesCovered.length > 0,
        3:
            formData.personalUseConfirmed &&
            formData.popiaConsent &&
            (formData.hasPreExistingDispute === "no" ||
                formData.preExistingDisputeDetails.trim()),
        4: true,
    };

    // Submits the whole wizard's worth of answers in one request - the
    // backend turns "pending" policy into "active" and applies everything
    // collected across all five steps at once.
    const handleConfirm = () => {
        setSubmitError(null);
        setSubmitting(true);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/policies/build`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        })
            .then((response) =>
                response
                    .json()
                    .then((data) =>
                        response.ok ? data : Promise.reject(new Error(data.message)),
                    ),
            )
            .then(() => navigate("/dashboard"))
            .catch((err) => setSubmitError(err.message))
            .finally(() => setSubmitting(false));
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Build Your Policy
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                A few questions so we know exactly what to cover.
            </Typography>

            <Stepper activeStep={step} sx={{ mb: 5 }} alternativeLabel>
                {STEP_LABELS.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Only the block matching the current step renders - the
                other four stay mounted-out entirely rather than hidden,
                so formData is the single source of truth across steps. */}
            <Card variant="outlined">
                <CardContent sx={{ p: 4 }}>
                    {step === 0 && (
                        <AboutYouStep
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {step === 1 && (
                        <DependantsStep
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {step === 2 && (
                        <CoverCategoriesStep
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {step === 3 && (
                        <DisclosuresStep
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {step === 4 && (
                        <ReviewStep
                            formData={formData}
                            submitError={submitError}
                            submitting={submitting}
                            onConfirm={handleConfirm}
                        />
                    )}

                    {/* Back/Next navigation - "Next" is hidden on the last
                        step, since Review has its own Confirm button, and
                        disabled elsewhere until stepValid[step] is met. */}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ justifyContent: "space-between", mt: 4 }}
                    >
                        <Button
                            variant="outlined"
                            disabled={step === 0}
                            onClick={() => setStep((s) => s - 1)}
                        >
                            Back
                        </Button>
                        {step < STEP_LABELS.length - 1 && (
                            <Button
                                variant="contained"
                                color="secondary"
                                disabled={!stepValid[step]}
                                onClick={() => setStep((s) => s + 1)}
                            >
                                Next
                            </Button>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
