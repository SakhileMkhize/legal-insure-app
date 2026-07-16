import { useEffect, useState } from "react";
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
import { useAuth } from "../../context/AuthContext";
import * as policyService from "../../services/policyService";
import * as consultationService from "../../services/consultationService";

const validationSchema = yup.object({
  category: yup.string().required("Category is required"),
  lawyerCategoryNotes: yup.string().notRequired(),
  scheduledAt: yup.string().required("Please choose a date and time"),
  notes: yup.string().trim().required("Let us know what you'd like to discuss"),
});

const LAWYERS = ["Adv. Kabelo Ntuli", "Adv. Refilwe Maseko", "Adv. Zanele Cele"];

export function Consultations() {
  const { currentUser } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      consultationService.listConsultationsForUser(currentUser.id),
      policyService.getPolicyForUser(currentUser.id),
    ])
      .then(([consultationsData, policyData]) => {
        setConsultations(consultationsData);
        setPolicy(policyData);
      })
      .catch(() => setError("We couldn't load your consultations right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const formik = useFormik({
    initialValues: { category: "", scheduledAt: "", notes: "" },
    validationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);
      consultationService
        .bookConsultation({
          ...values,
          userId: currentUser.id,
          lawyerName: LAWYERS[Math.floor(Math.random() * LAWYERS.length)],
        })
        .then(() => {
          resetForm();
          setDialogOpen(false);
          loadData();
        })
        .catch((err) => setSubmitError(err.message))
        .finally(() => setSubmitting(false));
    },
  });

  const canBook = policy && policy.consultationsIncluded !== 0;
  const upcoming = consultations.filter((c) => c.status === "scheduled");
  const past = consultations.filter((c) => c.status !== "scheduled");

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Consultations</Typography>
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

      {!loading && policy && !canBook && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your Basic plan doesn't include lawyer consultations. Upgrade to Premium or Ultimate to book one.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Upcoming</Typography>
            {upcoming.length === 0 && (
              <Typography variant="body2" color="text.secondary">No upcoming consultations.</Typography>
            )}
            <Stack spacing={2}>
              {upcoming.map((consultation) => (
                <Card key={consultation.id} variant="outlined">
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{consultation.lawyerName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(consultation.scheduledAt).toLocaleString()} · {consultation.notes}
                      </Typography>
                    </Box>
                    <StatusChip status={consultation.status} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Past</Typography>
            {past.length === 0 && (
              <Typography variant="body2" color="text.secondary">No past consultations yet.</Typography>
            )}
            <Stack spacing={2}>
              {past.map((consultation) => (
                <Card key={consultation.id} variant="outlined">
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{consultation.lawyerName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(consultation.scheduledAt).toLocaleString()} · {consultation.notes}
                      </Typography>
                    </Box>
                    <StatusChip status={consultation.status} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Book a Consultation</DialogTitle>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <DialogContent>
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <Stack spacing={2.5}>
              <TextField
                select
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
                fullWidth
              >
                {COVER_CATEGORIES.map((category) => (
                  <MenuItem key={category.id} value={category.id}>{category.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Preferred Date & Time"
                name="scheduledAt"
                type="datetime-local"
                value={formik.values.scheduledAt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.scheduledAt && Boolean(formik.errors.scheduledAt)}
                helperText={formik.touched.scheduledAt && formik.errors.scheduledAt}
                InputLabelProps={{ shrink: true }}
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
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Book
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
