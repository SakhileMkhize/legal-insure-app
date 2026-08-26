import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
import { CATEGORY_MAP } from "../../../../utils/categoryMap";
import { API_URL } from "../../../../../global";

// Validation rules for the "Book a Consultation" form.
const consultationSchema = yup.object({
    category: yup.string().required("Category is required"),
    practitionerId: yup.string().required("Please choose an attorney"),
    scheduledAt: yup.string().required("Please choose a date and time"),
    notes: yup
        .string()
        .trim()
        .required("Let us know what you'd like to discuss"),
});

// Same helper as Partners.jsx/PartnerDetail.jsx (name -> two-letter avatar
// initial); kept local rather than shared, since it's a one-liner.
function initialsOf(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

// Booking form: category first, then attorneys covering it are shown as
// clickable cards rather than a text dropdown - picking a name off a plain
// list of "Name — Firm" strings is exactly how someone books the wrong
// attorney by mistake, so this puts a face-shaped card, firm, and
// specializations in front of every choice instead. When arriving with an
// initialPractitionerId (from a partner's profile page), that attorney's
// own category is looked up and both fields are prefilled, with their
// card shown pre-selected.
export function BookingDialog({ open, onClose, onBooked, initialPractitionerId }) {
    const [submitError, setSubmitError] = useState(null);
    const [practitioners, setPractitioners] = useState([]);
    const [practitionersLoading, setPractitionersLoading] = useState(false);

    // Refetches the attorney options whenever the selected category
    // changes - only practitioners covering that category are offered.
    const loadPractitioners = (category) => {
        if (!category) {
            setPractitioners([]);
            return;
        }
        setPractitionersLoading(true);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/partners/?category=${category}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((data) => setPractitioners(Array.isArray(data) ? data : []))
            .catch(() => setPractitioners([]))
            .finally(() => setPractitionersLoading(false));
    };

    const formik = useFormik({
        initialValues: {
            category: "",
            practitionerId: initialPractitionerId || "",
            scheduledAt: "",
            notes: "",
        },
        validationSchema: consultationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            setSubmitError(null);
            const token = localStorage.getItem("token");
            fetch(`${API_URL}/consultations/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            })
                .then((response) =>
                    response
                        .json()
                        .then((data) =>
                            response.ok ? data : Promise.reject(new Error(data.message)),
                        ),
                )
                .then(() => {
                    resetForm();
                    onClose();
                    onBooked();
                })
                .catch((err) => setSubmitError(err.message))
                .finally(() => setSubmitting(false));
        },
    });

    // Looks up the preselected attorney's own category so the card list
    // isn't left empty, then prefills both fields.
    useEffect(() => {
        if (!initialPractitionerId) return;
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/partners/${initialPractitionerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((partner) => {
                if (!partner) return;
                const category = partner.categories?.[0];
                if (category) {
                    formik.setFieldValue("category", category);
                    loadPractitioners(category);
                }
                formik.setFieldValue("practitionerId", partner.id);
            })
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPractitionerId]);

    // Changing category clears any already-chosen attorney, since that
    // choice may no longer be valid for the new category, then reloads
    // the attorney list for it.
    const handleCategoryChange = (event) => {
        const category = event.target.value;
        formik.setFieldValue("category", category);
        formik.setFieldValue("practitionerId", "");
        loadPractitioners(category);
    };

    // Drives the submit button's label further down, so the very last
    // thing a client sees before committing is the attorney's name, not
    // just a generic "Book".
    const selectedPractitioner = practitioners.find(
        (practitioner) => practitioner.id === formik.values.practitionerId,
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Book a Consultation</DialogTitle>
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <DialogContent>
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}
                    <Stack spacing={2.5}>
                        <TextField
                            select
                            label="Category"
                            name="category"
                            value={formik.values.category}
                            onChange={handleCategoryChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.category &&
                                Boolean(formik.errors.category)
                            }
                            helperText={
                                formik.touched.category && formik.errors.category
                            }
                            fullWidth
                        >
                            {COVER_CATEGORIES.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Preferred Attorney
                            </Typography>

                            {!formik.values.category && (
                                <Typography variant="body2" color="text.secondary">
                                    Choose a category first.
                                </Typography>
                            )}
                            {formik.values.category && practitionersLoading && (
                                <Box sx={{ display: "flex", py: 2 }}>
                                    <CircularProgress size={20} />
                                </Box>
                            )}
                            {formik.values.category &&
                                !practitionersLoading &&
                                practitioners.length === 0 && (
                                    <Alert severity="info" variant="outlined">
                                        No attorneys cover this category yet.
                                    </Alert>
                                )}
                            {formik.values.category &&
                                !practitionersLoading &&
                                practitioners.length > 0 && (
                                    <Stack
                                        spacing={1.5}
                                        sx={{
                                            maxHeight: 300,
                                            overflowY: "auto",
                                            pr: 0.5,
                                        }}
                                    >
                                        {practitioners.map((practitioner) => {
                                            const selected =
                                                formik.values.practitionerId ===
                                                practitioner.id;
                                            return (
                                                <Card
                                                    key={practitioner.id}
                                                    variant="outlined"
                                                    onClick={() =>
                                                        formik.setFieldValue(
                                                            "practitionerId",
                                                            practitioner.id,
                                                        )
                                                    }
                                                    sx={{
                                                        cursor: "pointer",
                                                        borderColor: selected
                                                            ? "secondary.main"
                                                            : "divider",
                                                        borderWidth: selected ? 2 : 1,
                                                        "&:hover": {
                                                            borderColor: "secondary.main",
                                                        },
                                                    }}
                                                >
                                                    <CardContent
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1.5,
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: "secondary.main",
                                                                color: "secondary.contrastText",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {initialsOf(practitioner.name)}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ fontWeight: 600 }}
                                                                noWrap
                                                            >
                                                                {practitioner.displayName}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                noWrap
                                                            >
                                                                {practitioner.firm?.name}
                                                            </Typography>
                                                            {/* Shown even though the list is
                                                                already filtered to this
                                                                category - attorneys covering
                                                                more than one are otherwise
                                                                indistinguishable at a glance. */}
                                                            <Stack
                                                                direction="row"
                                                                spacing={0.5}
                                                                sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
                                                            >
                                                                {practitioner.categories?.map(
                                                                    (categoryId) => (
                                                                        <Chip
                                                                            key={categoryId}
                                                                            size="small"
                                                                            label={
                                                                                CATEGORY_MAP[categoryId]
                                                                                    ?.label ?? categoryId
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                        {selected && (
                                                            <CheckCircleIcon
                                                                color="secondary"
                                                                fontSize="small"
                                                            />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Stack>
                                )}

                            {formik.touched.practitionerId &&
                                formik.errors.practitionerId && (
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ display: "block", mt: 0.75 }}
                                    >
                                        {formik.errors.practitionerId}
                                    </Typography>
                                )}
                        </Box>

                        <TextField
                            label="Preferred Date & Time"
                            name="scheduledAt"
                            type="datetime-local"
                            value={formik.values.scheduledAt}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.scheduledAt &&
                                Boolean(formik.errors.scheduledAt)
                            }
                            helperText={
                                formik.touched.scheduledAt &&
                                formik.errors.scheduledAt
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                            fullWidth
                        />
                        <TextField
                            label="What would you like to discuss?"
                            name="notes"
                            value={formik.values.notes}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.notes && Boolean(formik.errors.notes)}
                            helperText={formik.touched.notes && formik.errors.notes}
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        disabled={formik.isSubmitting}
                        startIcon={
                            formik.isSubmitting ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : null
                        }
                    >
                        {selectedPractitioner
                            ? `Book with ${selectedPractitioner.displayName}`
                            : "Book"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
