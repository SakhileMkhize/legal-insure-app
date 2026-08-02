import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const contactSchema = yup.object({
    name: yup.string().trim().required("Name is required"),
    email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),
    subject: yup.string().trim().required("Subject is required"),
    message: yup
        .string()
        .trim()
        .min(10, "Message must be at least 10 characters")
        .required("Message is required"),
});

export function Contact() {
    const [sent, setSent] = useState(false);

    const formik = useFormik({
        initialValues: { name: "", email: "", subject: "", message: "" },
        validationSchema: contactSchema,
        onSubmit: (values, { resetForm }) => {
            setSent(true);
            resetForm();
        },
    });

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 2 }}
                >
                    Contact Us
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: "auto" }}
                >
                    Questions about a plan, a claim, or partnering with us? Send
                    us a message and our team will get back to you.
                </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Card variant="outlined" sx={{ flex: "2 1 420px" }}>
                    <CardContent>
                        {sent && (
                            <Alert
                                severity="success"
                                sx={{ mb: 3 }}
                                onClose={() => setSent(false)}
                            >
                                Thanks for reaching out , we'll be in touch
                                shortly.
                            </Alert>
                        )}
                        <Box
                            component="form"
                            onSubmit={formik.handleSubmit}
                            noValidate
                        >
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
                                        formik.touched.name &&
                                        formik.errors.name
                                    }
                                    fullWidth
                                />
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
                                        formik.touched.email &&
                                        formik.errors.email
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="Subject"
                                    name="subject"
                                    value={formik.values.subject}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.subject &&
                                        Boolean(formik.errors.subject)
                                    }
                                    helperText={
                                        formik.touched.subject &&
                                        formik.errors.subject
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="Message"
                                    name="message"
                                    value={formik.values.message}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.message &&
                                        Boolean(formik.errors.message)
                                    }
                                    helperText={
                                        formik.touched.message &&
                                        formik.errors.message
                                    }
                                    multiline
                                    rows={5}
                                    fullWidth
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                >
                                    Send Message
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                <Box
                    sx={{
                        flex: "1 1 280px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Card variant="outlined">
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ alignItems: "flex-start" }}
                                >
                                    <LocationOnIcon color="primary" />
                                    <Typography variant="body2">
                                        123 Long Street, Cape Town, 8001
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ alignItems: "flex-start" }}
                                >
                                    <PhoneIcon color="primary" />
                                    <Typography variant="body2">
                                        0800 123 456
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ alignItems: "flex-start" }}
                                >
                                    <EmailIcon color="primary" />
                                    <Typography variant="body2">
                                        support@legalinsure.co.za
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ alignItems: "flex-start" }}
                                >
                                    <AccessTimeIcon color="primary" />
                                    <Typography variant="body2">
                                        Mon–Fri, 08:00–17:00 (24/7 AI guidance)
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Box
                        sx={{
                            flexGrow: 1,
                            minHeight: 180,
                            borderRadius: 2,
                            bgcolor: "#E5E7EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Map placeholder
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
