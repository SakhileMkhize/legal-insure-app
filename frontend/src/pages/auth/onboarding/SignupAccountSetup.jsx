import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useOutletContext } from "react-router";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import { API_URL } from "../../../../global";

// oneOf([yup.ref("password")]) is how yup expresses "must equal another
// field" — it re-evaluates whenever either field changes.
const accountSetupSchema = yup.object({
    password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    acceptTerms: yup
        .boolean()
        .oneOf([true], "You must accept the terms to continue"),
});

export function SignupAccountSetup() {
    const { formData, updateFormData } = useOutletContext();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState(null);

    // Guards against skipping straight to this step without having
    // completed the first two (personal details and plan choice).
    useEffect(() => {
        if (!formData.email || !formData.planId) {
            navigate("/signup/details", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
        validationSchema: accountSetupSchema,
        onSubmit: (values, { setSubmitting }) => {
            setSubmitError(null);
            // This is where the whole wizard's collected data (name,
            // email, phone, chosen plan, and now a password) is finally
            // sent to the backend, in one signup call.
            const payload = { ...formData, password: values.password };
            fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then((response) =>
                    response
                        .json()
                        .then((data) =>
                            response.ok ? data : Promise.reject(new Error(data.message)),
                        ),
                )
                .then((data) => {
                    // Signup logs the new account straight in, rather
                    // than requiring a separate login step afterward.
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userId", data.id);
                    localStorage.setItem("role", data.role);
                    updateFormData({ password: values.password });
                    navigate("/signup/confirmation");
                })
                .catch((err) => setSubmitError(err.message))
                .finally(() => setSubmitting(false));
        },
    });

    return (
        <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Secure your account
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Set a password to finish creating your account.
                </Typography>

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.password &&
                                Boolean(formik.errors.password)
                            }
                            helperText={
                                formik.touched.password &&
                                formik.errors.password
                            }
                            fullWidth
                        />
                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.confirmPassword &&
                                Boolean(formik.errors.confirmPassword)
                            }
                            helperText={
                                formik.touched.confirmPassword &&
                                formik.errors.confirmPassword
                            }
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="acceptTerms"
                                    checked={formik.values.acceptTerms}
                                    onChange={formik.handleChange}
                                />
                            }
                            label="I agree to the Terms of Service and Privacy Policy"
                        />
                        {formik.touched.acceptTerms &&
                            formik.errors.acceptTerms && (
                                <Typography variant="caption" color="error">
                                    {formik.errors.acceptTerms}
                                </Typography>
                            )}

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/signup/plan")}
                                fullWidth
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                fullWidth
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
                                Create Account
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
