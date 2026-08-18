import { useState } from "react";
import { useFormik } from "formik";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { callRequestSchema } from "../constants";

// No backend endpoint exists for call requests yet - submitting just swaps
// the dialog's content for a thank-you message rather than closing it.
export function RequestCallDialog({ open, onClose }) {
    const [sent, setSent] = useState(false);

    const formik = useFormik({
        initialValues: { name: "", phone: "" },
        validationSchema: callRequestSchema,
        onSubmit: (values, { resetForm }) => {
            setSent(true);
            resetForm();
        },
    });

    const handleClose = () => {
        onClose();
        setSent(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Request a Call</DialogTitle>
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <DialogContent>
                    {sent ? (
                        <Alert severity="success">
                            Thanks - an advisor will call you back shortly.
                        </Alert>
                    ) : (
                        <Stack spacing={2.5}>
                            <TextField
                                label="Full Name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.name &&
                                    Boolean(formik.errors.name)
                                }
                                helperText={
                                    formik.touched.name && formik.errors.name
                                }
                                fullWidth
                            />
                            <TextField
                                label="Phone Number"
                                name="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.phone &&
                                    Boolean(formik.errors.phone)
                                }
                                helperText={
                                    formik.touched.phone && formik.errors.phone
                                }
                                fullWidth
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose}>
                        {sent ? "Close" : "Cancel"}
                    </Button>
                    {!sent && (
                        <Button type="submit" variant="contained" color="secondary">
                            Request Call
                        </Button>
                    )}
                </DialogActions>
            </Box>
        </Dialog>
    );
}
