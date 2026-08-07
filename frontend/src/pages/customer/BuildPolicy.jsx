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
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { CategoryIcon } from "../../components/common/CategoryIcon";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { formatDate } from "../../utils/formatDate";
import { API_URL } from "../../../global";

const STEP_LABELS = [
    "About You",
    "Dependants",
    "Cover Categories",
    "Disclosures",
    "Review",
];

const RELATIONSHIPS = ["Spouse", "Child", "Other"];

const EMPTY_DEPENDANT = { name: "", dateOfBirth: "", relationship: "" };

export function BuildPolicy() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [formData, setFormData] = useState({
        dateOfBirth: "",
        idNumber: "",
        address: "",
        dependants: [],
        categoriesCovered: [],
        hasPreExistingDispute: "no",
        preExistingDisputeDetails: "",
        personalUseConfirmed: false,
        popiaConsent: false,
    });
    const updateFormData = (updates) =>
        setFormData((prev) => ({ ...prev, ...updates }));

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

    const toggleCategory = (categoryId) => {
        const isSelected = formData.categoriesCovered.includes(categoryId);
        updateFormData({
            categoriesCovered: isSelected
                ? formData.categoriesCovered.filter((c) => c !== categoryId)
                : [...formData.categoriesCovered, categoryId],
        });
    };

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

            <Card variant="outlined">
                <CardContent sx={{ p: 4 }}>
                    {step === 0 && (
                        <Stack spacing={2.5}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                About You
                            </Typography>
                            <TextField
                                label="Date of Birth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) =>
                                    updateFormData({
                                        dateOfBirth: e.target.value,
                                    })
                                }
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                            <TextField
                                label="SA ID or Passport Number"
                                value={formData.idNumber}
                                onChange={(e) =>
                                    updateFormData({ idNumber: e.target.value })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Residential Address"
                                value={formData.address}
                                onChange={(e) =>
                                    updateFormData({ address: e.target.value })
                                }
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Stack>
                    )}

                    {step === 1 && (
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Dependants
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Optional — add a spouse or children you'd
                                    like covered under your policy.
                                </Typography>
                            </Box>

                            {formData.dependants.length === 0 && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
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
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {dependant.name} —{" "}
                                                {dependant.relationship}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Born{" "}
                                                {formatDate(
                                                    dependant.dateOfBirth,
                                                )}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            aria-label="Remove dependant"
                                            onClick={() =>
                                                removeDependant(index)
                                            }
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>

                            <Divider />

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                            >
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
                                            <MenuItem
                                                key={relationship}
                                                value={relationship}
                                            >
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
                    )}

                    {step === 2 && (
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Cover Categories
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Select every type of legal matter you'd
                                    like your policy to cover.
                                </Typography>
                            </Box>
                            <FormGroup>
                                {COVER_CATEGORIES.map((category) => (
                                    <FormControlLabel
                                        key={category.id}
                                        control={
                                            <Checkbox
                                                checked={formData.categoriesCovered.includes(
                                                    category.id,
                                                )}
                                                onChange={() =>
                                                    toggleCategory(category.id)
                                                }
                                            />
                                        }
                                        label={
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{ alignItems: "center" }}
                                            >
                                                <CategoryIcon
                                                    name={category.icon}
                                                    color="primary"
                                                    fontSize="small"
                                                />
                                                <Typography variant="body2">
                                                    {category.label}
                                                </Typography>
                                            </Stack>
                                        }
                                    />
                                ))}
                            </FormGroup>
                        </Stack>
                    )}

                    {step === 3 && (
                        <Stack spacing={2.5}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Disclosures
                            </Typography>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Do you currently have, or are you aware of,
                                    any pending legal dispute or matter?
                                </Typography>
                                <RadioGroup
                                    row
                                    value={formData.hasPreExistingDispute}
                                    onChange={(e) =>
                                        updateFormData({
                                            hasPreExistingDispute:
                                                e.target.value,
                                        })
                                    }
                                >
                                    <FormControlLabel
                                        value="no"
                                        control={<Radio />}
                                        label="No"
                                    />
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
                                            preExistingDisputeDetails:
                                                e.target.value,
                                        })
                                    }
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            )}
                            {formData.hasPreExistingDispute === "yes" && (
                                <Alert severity="info" variant="outlined">
                                    This matter will be excluded from your
                                    cover, in line with our policy terms.
                                    Everything else you're covered for still
                                    applies.
                                </Alert>
                            )}

                            <Divider />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.personalUseConfirmed}
                                        onChange={(e) =>
                                            updateFormData({
                                                personalUseConfirmed:
                                                    e.target.checked,
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
                                            updateFormData({
                                                popiaConsent: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label="I consent to LegalInsure processing my personal information in accordance with POPIA."
                            />
                        </Stack>
                    )}

                    {step === 4 && (
                        <Stack spacing={2.5}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Review &amp; Confirm
                            </Typography>

                            {submitError && (
                                <Alert severity="error">{submitError}</Alert>
                            )}

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                >
                                    About You
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Born {formatDate(formData.dateOfBirth)} ·{" "}
                                    {formData.idNumber} · {formData.address}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Dependants
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {formData.dependants.length === 0
                                        ? "None added."
                                        : formData.dependants
                                              .map((d) => d.name)
                                              .join(", ")}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Cover Categories
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {formData.categoriesCovered
                                        .map(
                                            (id) =>
                                                COVER_CATEGORIES.find(
                                                    (c) => c.id === id,
                                                )?.label,
                                        )
                                        .join(", ")}
                                </Typography>
                            </Box>

                            {formData.hasPreExistingDispute === "yes" && (
                                <Alert severity="warning" variant="outlined">
                                    Your disclosed pre-existing matter will not
                                    be covered.
                                </Alert>
                            )}

                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                disabled={submitting}
                                startIcon={
                                    submitting ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    ) : null
                                }
                                onClick={handleConfirm}
                            >
                                Confirm &amp; Activate Policy
                            </Button>
                        </Stack>
                    )}

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
