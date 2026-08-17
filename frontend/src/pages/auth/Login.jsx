import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useLocation, NavLink } from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { API_URL } from "../../../global";

// Validation rules for the login form.
const loginSchema = yup.object({
    email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),
    password: yup.string().required("Password is required"),
});

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [submitError, setSubmitError] = useState(null);

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: loginSchema,
        onSubmit: (values, { setSubmitting }) => {
            setSubmitError(null);
            fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                }),
            })
                .then((response) =>
                    response
                        .json()
                        .then((data) =>
                            response.ok ? data : Promise.reject(new Error(data.message)),
                        ),
                )
                .then((data) => {
                    // Auth state lives in localStorage, not a cookie or
                    // context provider — every protected route reads it
                    // directly (see ProtectedRoute/RequireRole in App.jsx).
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userId", data.id);
                    localStorage.setItem("role", data.role);
                    // If the visitor was redirected here from a protected
                    // page, send them back to it; otherwise land on the
                    // role-appropriate home page.
                    const fallback =
                        data.role === "admin" ? "/admin" : "/dashboard";
                    navigate(location.state?.from?.pathname ?? fallback, {
                        replace: true,
                    });
                })
                .catch((err) => setSubmitError(err.message))
                .finally(() => setSubmitting(false));
        },
    });

    return (
        <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Welcome back
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Log in to access your legal cover dashboard.
                </Typography>

                {/* Demo credentials shown directly on the login screen —
                    convenient for a capstone/demo build, would not belong
                    in a production login page. */}
                <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Demo accounts
                    </Typography>
                    <Typography variant="body2">
                        Customer: thandeka@example.com / Password1
                    </Typography>
                    <Typography variant="body2">
                        Admin: admin@legalinsure.co.za / Admin123
                    </Typography>
                </Alert>

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.email &&
                                Boolean(formik.errors.email)
                            }
                            helperText={
                                formik.touched.email && formik.errors.email
                            }
                            fullWidth
                        />
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
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            size="large"
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
                            Log In
                        </Button>
                    </Stack>
                </Box>

                <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
                    New client?{" "}
                    <Link component={NavLink} to="/signup">
                        Create an account
                    </Link>
                </Typography>
            </CardContent>
        </Card>
    );
}
