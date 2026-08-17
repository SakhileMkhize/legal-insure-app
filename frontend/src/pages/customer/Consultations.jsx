import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useFormik } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import { StatusChip } from "../../components/common/StatusChip";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { formatDateTime } from "../../utils/formatDate";
import { API_URL } from "../../../global";

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

export function Consultations() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [consultations, setConsultations] = useState([]);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [practitioners, setPractitioners] = useState([]);
    const [practitionersLoading, setPractitionersLoading] = useState(false);

    const loadData = () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API_URL}/consultations/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/policies/me`, { headers }).then((response) => response.json()),
        ])
            .then(([consultationsData, policyData]) => {
                setConsultations(consultationsData);
                setPolicy(policyData);
            })
            .catch(() =>
                setError("We couldn't load your consultations right now."),
            )
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            practitionerId: searchParams.get("practitioner") || "",
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
                    setDialogOpen(false);
                    loadData();
                })
                .catch((err) => setSubmitError(err.message))
                .finally(() => setSubmitting(false));
        },
    });

    // Arriving from a partner's profile with a preferred attorney already
    // chosen (?practitioner=pr1) opens straight into the booking dialog,
    // prefilled with that attorney's category so the dropdown isn't left
    // pointing at a practitioner that isn't in its (empty) option list.
    useEffect(() => {
        const practitionerId = searchParams.get("practitioner");
        if (!practitionerId) return;

        setDialogOpen(true);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/partners/${practitionerId}`, {
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
    }, []);

    // Changing category clears any already-chosen attorney, since that
    // choice may no longer be valid for the new category, then reloads
    // the attorney list for it.
    const handleCategoryChange = (event) => {
        const category = event.target.value;
        formik.setFieldValue("category", category);
        formik.setFieldValue("practitionerId", "");
        loadPractitioners(category);
    };

    // Booking is blocked until the policy is active and the plan actually
    // includes consultations (0 on the Basic plan).
    const canBook =
        policy &&
        policy.status !== "pending" &&
        policy.consultationsIncluded !== 0;
    const upcoming = consultations.filter((c) => c.status === "scheduled");
    const past = consultations.filter((c) => c.status !== "scheduled");

    return (
        <Box>
            <Stack
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Consultations
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                    disabled={!canBook}
                >
                    Book Consultation
                </Button>
            </Stack>

            {/* Two mutually-exclusive reasons booking might be disabled:
                policy not built yet, or the current plan excludes
                consultations entirely. */}
            {!loading && policy?.status === "pending" && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                navigate("/dashboard/build-policy")
                            }
                        >
                            Build Policy
                        </Button>
                    }
                >
                    Your policy hasn't been built yet. Finish setting up your
                    cover before booking a consultation.
                </Alert>
            )}
            {!loading && policy?.status !== "pending" && !canBook && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Your Basic plan doesn't include lawyer consultations.
                    Upgrade to Premium or Ultimate to book one.
                </Alert>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && error && <Alert severity="error">{error}</Alert>}

            {/* Consultations split into Upcoming (scheduled) and Past
                (completed/cancelled) sections, each rendered as its own
                list of cards. */}
            {!loading && !error && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 1.5 }}
                        >
                            Upcoming
                        </Typography>
                        {upcoming.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No upcoming consultations.
                            </Typography>
                        )}
                        <Stack spacing={2}>
                            {upcoming.map((consultation) => (
                                <Card key={consultation.id} variant="outlined">
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {consultation.lawyerName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {formatDateTime(
                                                    consultation.scheduledAt,
                                                )}{" "}
                                                · {consultation.notes}
                                            </Typography>
                                        </Box>
                                        <StatusChip
                                            status={consultation.status}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>

                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 1.5 }}
                        >
                            Past
                        </Typography>
                        {past.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No past consultations yet.
                            </Typography>
                        )}
                        <Stack spacing={2}>
                            {past.map((consultation) => (
                                <Card key={consultation.id} variant="outlined">
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {consultation.lawyerName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {formatDateTime(
                                                    consultation.scheduledAt,
                                                )}{" "}
                                                · {consultation.notes}
                                            </Typography>
                                        </Box>
                                        <StatusChip
                                            status={consultation.status}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            )}

            {/* Booking form: category first, then a dependent "Preferred
                Attorney" dropdown scoped to that category. */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
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
                                    formik.touched.category &&
                                    formik.errors.category
                                }
                                fullWidth
                            >
                                {COVER_CATEGORIES.map((category) => (
                                    <MenuItem
                                        key={category.id}
                                        value={category.id}
                                    >
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
                                // Falls back through: a validation error
                                // first, then a category prompt, then a
                                // no-matches notice — each only shown when
                                // it actually applies.
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
                                    !formik.values.category ||
                                    practitionersLoading
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
                                error={
                                    formik.touched.notes &&
                                    Boolean(formik.errors.notes)
                                }
                                helperText={
                                    formik.touched.notes && formik.errors.notes
                                }
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            disabled={formik.isSubmitting}
                            startIcon={
                                formik.isSubmitting ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : null
                            }
                        >
                            Book
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
