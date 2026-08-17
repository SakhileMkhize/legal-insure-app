import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useOutletContext } from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

// Validation rules for step 1 of signup.
const personalDetailsSchema = yup.object({
    firstName: yup.string().trim().required("First name is required"),
    lastName: yup.string().trim().required("Last name is required"),
    email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),
    phone: yup.string().trim().required("Phone number is required"),
});

export function SignupPersonalDetails() {
    // formData/updateFormData come from the Onboarding layout route via
    // Outlet context — this step reads its slice of the shared object and
    // writes back into the same object, rather than owning its own state.
    const { formData, updateFormData } = useOutletContext();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
        },
        validationSchema: personalDetailsSchema,
        onSubmit: (values) => {
            // No API call here — these fields aren't submitted until the
            // final "Create Account" step, after a plan is chosen.
            updateFormData(values);
            navigate("/signup/plan");
        },
    });

    return (
        <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Tell us about yourself
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    We'll use these details to set up your account.
                </Typography>

                <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
                    If you are an institutional client, please call 0860 100
                    1000.
                </Alert>

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2.5}
                        >
                            <TextField
                                label="First Name"
                                name="firstName"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.firstName &&
                                    Boolean(formik.errors.firstName)
                                }
                                helperText={
                                    formik.touched.firstName &&
                                    formik.errors.firstName
                                }
                                fullWidth
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.lastName &&
                                    Boolean(formik.errors.lastName)
                                }
                                helperText={
                                    formik.touched.lastName &&
                                    formik.errors.lastName
                                }
                                fullWidth
                            />
                        </Stack>
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
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            size="large"
                        >
                            Next
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
