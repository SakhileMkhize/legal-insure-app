import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { EMPLOYMENT_STATUSES, MARITAL_STATUSES, EMPTY_KIN } from "../constants";

// Date of birth, ID/passport, address, employment/marital status, and a
// next-of-kin list - everything else on My Account also lets people edit
// these later, this step just collects them up front.
export function AboutYouStep({ formData, updateFormData }) {
    const [newKin, setNewKin] = useState(EMPTY_KIN);

    const addKin = () => {
        updateFormData({ nextOfKin: [...formData.nextOfKin, newKin] });
        setNewKin(EMPTY_KIN);
    };

    const removeKin = (index) => {
        updateFormData({
            nextOfKin: formData.nextOfKin.filter((_, i) => i !== index),
        });
    };

    return (
        <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                About You
            </Typography>
            <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                    updateFormData({ dateOfBirth: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
            />
            <TextField
                label="SA ID or Passport Number"
                value={formData.idNumber}
                onChange={(e) => updateFormData({ idNumber: e.target.value })}
                fullWidth
            />
            <TextField
                label="Residential Address"
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                multiline
                rows={2}
                fullWidth
            />

            <Divider />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Employment &amp; Marital Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Optional - helps verify labour disputes and other
                    employment-related claims.
                </Typography>
            </Box>
            <TextField
                label="Employer Name"
                value={formData.employerName}
                onChange={(e) =>
                    updateFormData({ employerName: e.target.value })
                }
                fullWidth
            />
            <TextField
                label="Occupation"
                value={formData.occupation}
                onChange={(e) =>
                    updateFormData({ occupation: e.target.value })
                }
                fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                    <InputLabel>Employment Status</InputLabel>
                    <Select
                        label="Employment Status"
                        value={formData.employmentStatus}
                        onChange={(e) =>
                            updateFormData({
                                employmentStatus: e.target.value,
                            })
                        }
                    >
                        {EMPLOYMENT_STATUSES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Marital Status</InputLabel>
                    <Select
                        label="Marital Status"
                        value={formData.maritalStatus}
                        onChange={(e) =>
                            updateFormData({ maritalStatus: e.target.value })
                        }
                    >
                        {MARITAL_STATUSES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Divider />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Next of Kin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Optional - someone to contact in an emergency.
                </Typography>
            </Box>
            {formData.nextOfKin.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    No contacts added yet.
                </Typography>
            )}
            <Stack spacing={1.5}>
                {formData.nextOfKin.map((contact, index) => (
                    <Stack
                        key={`${contact.name}-${index}`}
                        direction="row"
                        sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {contact.name}
                                {contact.relationship
                                    ? ` - ${contact.relationship}`
                                    : ""}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {contact.phone}
                                {contact.email ? ` · ${contact.email}` : ""}
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            aria-label="Remove contact"
                            onClick={() => removeKin(index)}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ))}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Full Name"
                    value={newKin.name}
                    onChange={(e) =>
                        setNewKin((prev) => ({ ...prev, name: e.target.value }))
                    }
                    fullWidth
                />
                <TextField
                    label="Relationship"
                    value={newKin.relationship}
                    onChange={(e) =>
                        setNewKin((prev) => ({
                            ...prev,
                            relationship: e.target.value,
                        }))
                    }
                    fullWidth
                />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Phone"
                    value={newKin.phone}
                    onChange={(e) =>
                        setNewKin((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    fullWidth
                />
                <TextField
                    label="Email (optional)"
                    value={newKin.email}
                    onChange={(e) =>
                        setNewKin((prev) => ({ ...prev, email: e.target.value }))
                    }
                    fullWidth
                />
            </Stack>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!newKin.name || !newKin.phone}
                onClick={addKin}
                sx={{ alignSelf: "flex-start" }}
            >
                Add Contact
            </Button>
        </Stack>
    );
}
