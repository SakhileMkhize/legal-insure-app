import { useState } from "react";
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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
import { formatDate } from "../../../../utils/formatDate";
import { PAYMENT_METHODS, EMPTY_HISTORY_ENTRY } from "../constants";

// Pre-existing dispute disclosure, banking details, structured legal
// history, and the two consent checkboxes required to activate cover.
export function DisclosuresStep({ formData, updateFormData }) {
    const [newHistoryEntry, setNewHistoryEntry] = useState(
        EMPTY_HISTORY_ENTRY,
    );

    const addHistoryEntry = () => {
        updateFormData({
            legalHistory: [...formData.legalHistory, newHistoryEntry],
        });
        setNewHistoryEntry(EMPTY_HISTORY_ENTRY);
    };

    const removeHistoryEntry = (index) => {
        updateFormData({
            legalHistory: formData.legalHistory.filter((_, i) => i !== index),
        });
    };

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

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Banking Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Optional for now - needed once premium collection starts.
                    Can also be added later from My Account.
                </Typography>
            </Box>
            <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                        updateFormData({ paymentMethod: e.target.value })
                    }
                >
                    {PAYMENT_METHODS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Bank Name"
                    value={formData.bankName}
                    onChange={(e) =>
                        updateFormData({ bankName: e.target.value })
                    }
                    fullWidth
                />
                <TextField
                    label="Account Holder"
                    value={formData.accountHolder}
                    onChange={(e) =>
                        updateFormData({ accountHolder: e.target.value })
                    }
                    fullWidth
                />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) =>
                        updateFormData({ accountNumber: e.target.value })
                    }
                    fullWidth
                />
                <TextField
                    label="Branch Code"
                    value={formData.branchCode}
                    onChange={(e) =>
                        updateFormData({ branchCode: e.target.value })
                    }
                    fullWidth
                />
            </Stack>

            <Divider />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Legal History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Optional - disclose any past or ongoing legal matters so
                    cover can be assessed accurately.
                </Typography>
            </Box>
            {formData.legalHistory.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    No history disclosed yet.
                </Typography>
            )}
            <Stack spacing={1.5}>
                {formData.legalHistory.map((entry, index) => (
                    <Stack
                        key={`${entry.description}-${index}`}
                        direction="row"
                        sx={{
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {COVER_CATEGORIES.find(
                                    (c) => c.id === entry.category,
                                )?.label ?? "General"}
                                {entry.wasInsuredClaim
                                    ? ` · Claimed via ${entry.otherInsurer || "another insurer"}`
                                    : ""}
                            </Typography>
                            <Typography variant="body2">
                                {entry.description}
                            </Typography>
                            {entry.occurredAt && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {formatDate(entry.occurredAt)}
                                </Typography>
                            )}
                        </Box>
                        <IconButton
                            size="small"
                            aria-label="Remove entry"
                            onClick={() => removeHistoryEntry(index)}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ))}
            </Stack>
            <FormControl fullWidth>
                <InputLabel>Category (optional)</InputLabel>
                <Select
                    label="Category (optional)"
                    value={newHistoryEntry.category}
                    onChange={(e) =>
                        setNewHistoryEntry((prev) => ({
                            ...prev,
                            category: e.target.value,
                        }))
                    }
                >
                    <MenuItem value="">Not applicable</MenuItem>
                    {COVER_CATEGORIES.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            {category.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="Description"
                value={newHistoryEntry.description}
                onChange={(e) =>
                    setNewHistoryEntry((prev) => ({
                        ...prev,
                        description: e.target.value,
                    }))
                }
                multiline
                rows={2}
                fullWidth
            />
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: { sm: "center" } }}
            >
                <TextField
                    label="When did this occur?"
                    type="date"
                    value={newHistoryEntry.occurredAt}
                    onChange={(e) =>
                        setNewHistoryEntry((prev) => ({
                            ...prev,
                            occurredAt: e.target.value,
                        }))
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={newHistoryEntry.wasInsuredClaim}
                            onChange={(e) =>
                                setNewHistoryEntry((prev) => ({
                                    ...prev,
                                    wasInsuredClaim: e.target.checked,
                                }))
                            }
                        />
                    }
                    label="Claimed via another insurer"
                    sx={{ whiteSpace: "nowrap" }}
                />
            </Stack>
            {/* Only relevant when the checkbox above is ticked. */}
            {newHistoryEntry.wasInsuredClaim && (
                <TextField
                    label="Which insurer?"
                    value={newHistoryEntry.otherInsurer}
                    onChange={(e) =>
                        setNewHistoryEntry((prev) => ({
                            ...prev,
                            otherInsurer: e.target.value,
                        }))
                    }
                    fullWidth
                />
            )}
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!newHistoryEntry.description.trim()}
                onClick={addHistoryEntry}
                sx={{ alignSelf: "flex-start" }}
            >
                Add Entry
            </Button>

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
