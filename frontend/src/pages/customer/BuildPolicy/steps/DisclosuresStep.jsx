import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";

// Pre-existing dispute disclosure plus the two consent checkboxes required
// to activate cover. Banking details and legal history are collected
// later from My Account instead of here, to keep this step short.
export function DisclosuresStep({ formData, updateFormData }) {
    return (
        <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Disclosures
            </Typography>
            <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    Do you currently have, or are you aware of, any pending
                    legal dispute or matter?
                </Typography>
                <RadioGroup
                    row
                    value={formData.hasPreExistingDispute}
                    onChange={(e) =>
                        updateFormData({
                            hasPreExistingDispute: e.target.value,
                        })
                    }
                >
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                    <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                    />
                </RadioGroup>
            </Box>
            {formData.hasPreExistingDispute === "yes" && (
                <TextField
                    label="Please briefly describe the matter"
                    value={formData.preExistingDisputeDetails}
                    onChange={(e) =>
                        updateFormData({
                            preExistingDisputeDetails: e.target.value,
                        })
                    }
                    multiline
                    rows={3}
                    fullWidth
                />
            )}
            {formData.hasPreExistingDispute === "yes" && (
                <Alert severity="info" variant="outlined">
                    This matter will be excluded from your cover, in line
                    with our policy terms. Everything else you're covered for
                    still applies.
                </Alert>
            )}

            <Divider />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.personalUseConfirmed}
                        onChange={(e) =>
                            updateFormData({
                                personalUseConfirmed: e.target.checked,
                            })
                        }
                    />
                }
                label="I confirm this cover is for my personal use, not for a business or trade."
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.popiaConsent}
                        onChange={(e) =>
                            updateFormData({ popiaConsent: e.target.checked })
                        }
                    />
                }
                label="I consent to LegalInsure processing my personal information in accordance with POPIA."
            />
        </Stack>
    );
}
