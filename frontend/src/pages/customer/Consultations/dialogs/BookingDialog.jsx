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
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
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

// Booking form: category first, then a dependent "Preferred Attorney"
// dropdown scoped to that category. When arriving with an
// initialPractitionerId (from a partner's profile page), that attorney's
// own category is looked up and both fields are prefilled.
export function BookingDialog({ open, onClose, onBooked, initialPractitionerId }) {
    const [submitError, setSubmitError] = useState(null);
    const [practitioners, setPractitioners] = useState([]);
    const [practitionersLoading, setPractitionersLoading] = useState(false);

    // Refetches the "Preferred Attorney" options whenever the selected
    // category changes — only practitioners covering that category are
    // offered, so the field is disabled until a category is picked.
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

    // Looks up the preselected attorney's own category so the dropdown
    // isn't left pointing at a practitioner that isn't in its (empty)
    // option list, then prefills both fields.
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
            .catch(() => {});
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
                        <TextField
                            select
                            label="Preferred Attorney"
                            name="practitionerId"
                            value={formik.values.practitionerId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.practitionerId &&
                                Boolean(formik.errors.practitionerId)
                            }
                            // Falls back through: a validation error first,
                            // then a category prompt, then a no-matches
                            // notice — each only shown when it applies.
                            helperText={
                                (formik.touched.practitionerId &&
                                    formik.errors.practitionerId) ||
                                (!formik.values.category
                                    ? "Choose a category first"
                                    : practitioners.length === 0 &&
                                        !practitionersLoading
                                      ? "No attorneys cover this category yet"
                                      : "")
                            }
                            disabled={
                                !formik.values.category || practitionersLoading
                            }
                            fullWidth
                        >
                            {practitioners.map((practitioner) => (
                                <MenuItem
                                    key={practitioner.id}
                                    value={practitioner.id}
                                >
                                    {practitioner.displayName} —{" "}
                                    {practitioner.firm?.name}
                                </MenuItem>
                            ))}
                        </TextField>
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
                        Book
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
