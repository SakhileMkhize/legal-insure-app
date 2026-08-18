import { useState } from "react";
import { useFormik } from "formik";
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
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
import { API_URL } from "../../../../../global";
import { claimSchema } from "../constants";
import { uploadClaimDocuments } from "../api";

// A formik-driven form for the claim fields, plus an independent
// staged-file picker for evidence attached before the claim exists - the
// claim is created first, then any staged files are uploaded against its
// new id.
export function NewClaimDialog({ open, onClose, onCreated, onEvidenceWarning }) {
    const [submitError, setSubmitError] = useState(null);
    const [files, setFiles] = useState([]);

    // Adds newly picked files to the staged list without discarding files
    // picked earlier; the input is cleared each time so selecting the same
    // file twice still fires a change event.
    const handleFileSelect = (event) => {
        setFiles((prev) => [...prev, ...Array.from(event.target.files)]);
        event.target.value = "";
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        onClose();
        setFiles([]);
    };

    const formik = useFormik({
        initialValues: {
            category: "",
            title: "",
            description: "",
            amountClaimed: "",
        },
        validationSchema: claimSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            setSubmitError(null);
            const token = localStorage.getItem("token");
            fetch(`${API_URL}/claims/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...values,
                    amountClaimed: Number(values.amountClaimed),
                }),
            })
                .then((response) =>
                    response
                        .json()
                        .then((data) =>
                            response.ok ? data : Promise.reject(new Error(data.message)),
                        ),
                )
                .then((claim) => {
                    // The dialog closes and the list reloads immediately
                    // either way; a failed upload only shows a warning
                    // rather than blocking on it, since the claim itself
                    // was submitted successfully.
                    resetForm();
                    handleClose();
                    onCreated();

                    const pendingFiles = files;
                    setFiles([]);
                    if (pendingFiles.length > 0) {
                        uploadClaimDocuments(claim.id, pendingFiles).catch(() =>
                            onEvidenceWarning(
                                `Your claim was submitted, but the attached evidence failed to upload. You can attach it again from "${claim.title}" in the list below.`,
                            ),
                        );
                    }
                })
                .catch((err) => setSubmitError(err.message))
                .finally(() => setSubmitting(false));
        },
    });

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Submit a New Claim</DialogTitle>
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
                            onChange={formik.handleChange}
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
                            error={
                                formik.touched.description &&
                                Boolean(formik.errors.description)
                            }
                            helperText={
                                formik.touched.description &&
                                formik.errors.description
                            }
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
                            error={
                                formik.touched.amountClaimed &&
                                Boolean(formik.errors.amountClaimed)
                            }
                            helperText={
                                formik.touched.amountClaimed &&
                                formik.errors.amountClaimed
                            }
                            fullWidth
                        />
                        <Box>
                            <Button
                                component="label"
                                variant="outlined"
                                size="small"
                                startIcon={<AttachFileIcon fontSize="small" />}
                            >
                                Attach Evidence (optional)
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                            {files.length > 0 && (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}
                                >
                                    {files.map((file, index) => (
                                        <Chip
                                            key={`${file.name}-${index}`}
                                            label={file.name}
                                            size="small"
                                            onDelete={() => removeFile(index)}
                                        />
                                    ))}
                                </Stack>
                            )}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                            >
                                PDF, JPG, PNG, DOC or DOCX - up to 10MB each.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose}>Cancel</Button>
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
                        Submit Claim
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
