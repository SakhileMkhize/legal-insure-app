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
import { formatDate } from "../../../../utils/formatDate";
import { RELATIONSHIPS, EMPTY_DEPENDANT } from "../constants";

// Optional list of covered dependants, each added via the mini-form below
// the existing list.
export function DependantsStep({ formData, updateFormData }) {
    const [newDependant, setNewDependant] = useState(EMPTY_DEPENDANT);

    const addDependant = () => {
        updateFormData({ dependants: [...formData.dependants, newDependant] });
        setNewDependant(EMPTY_DEPENDANT);
    };

    const removeDependant = (index) => {
        updateFormData({
            dependants: formData.dependants.filter((_, i) => i !== index),
        });
    };

    return (
        <Stack spacing={2.5}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Dependants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Optional - add a spouse or children you'd like covered
                    under your policy.
                </Typography>
            </Box>

            {formData.dependants.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    No dependants added yet.
                </Typography>
            )}
            <Stack spacing={1.5}>
                {formData.dependants.map((dependant, index) => (
                    <Stack
                        key={`${dependant.name}-${index}`}
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
                                {dependant.name} - {dependant.relationship}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Born {formatDate(dependant.dateOfBirth)}
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            aria-label="Remove dependant"
                            onClick={() => removeDependant(index)}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ))}
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Full Name"
                    value={newDependant.name}
                    onChange={(e) =>
                        setNewDependant((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                    fullWidth
                />
                <TextField
                    label="Date of Birth"
                    type="date"
                    value={newDependant.dateOfBirth}
                    onChange={(e) =>
                        setNewDependant((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                        }))
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                />
                <FormControl fullWidth>
                    <InputLabel>Relationship</InputLabel>
                    <Select
                        label="Relationship"
                        value={newDependant.relationship}
                        onChange={(e) =>
                            setNewDependant((prev) => ({
                                ...prev,
                                relationship: e.target.value,
                            }))
                        }
                    >
                        {RELATIONSHIPS.map((relationship) => (
                            <MenuItem key={relationship} value={relationship}>
                                {relationship}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={
                    !newDependant.name ||
                    !newDependant.dateOfBirth ||
                    !newDependant.relationship
                }
                onClick={addDependant}
                sx={{ alignSelf: "flex-start" }}
            >
                Add Dependant
            </Button>
        </Stack>
    );
}
