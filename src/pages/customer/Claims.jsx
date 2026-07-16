import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
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
import * as claimService from "../../services/claimService";

const validationSchema = yup.object({
  category: yup.string().required("Category is required"),
  title: yup.string().trim().required("Title is required"),
  description: yup.string().trim().min(10, "Please provide more detail").required("Description is required"),
  amountClaimed: yup.number().typeError("Enter a valid amount").positive("Must be greater than 0").required("Amount is required"),
});

export function Claims() {
  const { currentUser } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadClaims = () => {
    setLoading(true);
    setError(null);
    claimService
      .listClaims(currentUser.id)
      .then(setClaims)
      .catch(() => setError("We couldn't load your claims right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const formik = useFormik({
    initialValues: { category: "", title: "", description: "", amountClaimed: "" },
    validationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);
      claimService
        .submitClaim({ ...values, amountClaimed: Number(values.amountClaimed), userId: currentUser.id })
        .then(() => {
          resetForm();
          setDialogOpen(false);
          loadClaims();
        })
        .catch((err) => setSubmitError(err.message))
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>My Claims</Typography>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Submit New Claim
        </Button>
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && claims.length === 0 && (
        <Alert severity="info">You haven't submitted any claims yet.</Alert>
      )}
      {!loading && !error && claims.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.submittedAt}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>{claim.category}</TableCell>
                  <TableCell>{claim.title}</TableCell>
                  <TableCell align="right">R{claim.amountClaimed.toLocaleString()}</TableCell>
                  <TableCell><StatusChip status={claim.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Submit a New Claim</DialogTitle>
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
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Amount Claimed (R)"
                name="amountClaimed"
                type="number"
                value={formik.values.amountClaimed}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amountClaimed && Boolean(formik.errors.amountClaimed)}
                helperText={formik.touched.amountClaimed && formik.errors.amountClaimed}
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
              Submit Claim
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
