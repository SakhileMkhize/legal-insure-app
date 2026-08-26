import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
import { formatDate } from "../../../../utils/formatDate";
import { EMPLOYMENT_STATUSES, MARITAL_STATUSES } from "../constants";

// Read-only summary of every prior step, with the final submit button that
// hands everything collected so far to the backend in one request.
export function ReviewStep({ formData, submitError, submitting, onConfirm }) {
    return (
        <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Review &amp; Confirm
            </Typography>

            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    About You
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Born {formatDate(formData.dateOfBirth)} · {formData.idNumber}{" "}
                    · {formData.address}
                </Typography>
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Employment &amp; Marital Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {[
                        EMPLOYMENT_STATUSES.find(
                            (o) => o.value === formData.employmentStatus,
                        )?.label,
                        formData.occupation,
                        formData.employerName,
                        MARITAL_STATUSES.find(
                            (o) => o.value === formData.maritalStatus,
                        )?.label,
                    ]
                        .filter(Boolean)
                        .join(" · ") || "Not provided."}
                </Typography>
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Next of Kin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {formData.nextOfKin.length === 0
                        ? "None added."
                        : formData.nextOfKin.map((k) => k.name).join(", ")}
                </Typography>
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Dependants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {formData.dependants.length === 0
                        ? "None added."
                        : formData.dependants.map((d) => d.name).join(", ")}
                </Typography>
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Cover Categories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {formData.categoriesCovered
                        .map(
                            (id) =>
                                COVER_CATEGORIES.find((c) => c.id === id)?.label,
                        )
                        .join(", ")}
                </Typography>
            </Box>

            {formData.hasPreExistingDispute === "yes" && (
                <Alert severity="warning" variant="outlined">
                    Your disclosed pre-existing matter will not be covered.
                </Alert>
            )}

            <Button
                variant="contained"
                color="secondary"
                size="large"
                disabled={submitting}
                startIcon={
                    submitting ? (
                        <CircularProgress size={18} color="inherit" />
                    ) : null
                }
                onClick={onConfirm}
            >
                Confirm &amp; Activate Policy
            </Button>
        </Stack>
    );
}
