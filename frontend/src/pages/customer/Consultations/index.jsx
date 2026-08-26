import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import { API_URL } from "../../../../global";
import { ConsultationGroup } from "./sections/ConsultationGroup";
import { BookingDialog } from "./dialogs/BookingDialog";

// The booking form lives in ./dialogs/BookingDialog - this file only owns
// the consultation list and the two reasons booking might be disabled.
export function Consultations() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [consultations, setConsultations] = useState([]);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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

    // Arriving from a partner's profile with a preferred attorney already
    // chosen (?practitioner=pr1) opens straight into the booking dialog;
    // BookingDialog itself handles prefilling the form from the id.
    useEffect(() => {
        if (searchParams.get("practitioner")) setDialogOpen(true);
    }, [searchParams]);

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
                (completed/cancelled) sections. */}
            {!loading && !error && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <ConsultationGroup
                        title="Upcoming"
                        consultations={upcoming}
                        emptyText="No upcoming consultations."
                        navigate={navigate}
                    />
                    <ConsultationGroup
                        title="Past"
                        consultations={past}
                        emptyText="No past consultations yet."
                        navigate={navigate}
                    />
                </Box>
            )}

            <BookingDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onBooked={loadData}
                initialPractitionerId={searchParams.get("practitioner") || ""}
            />
        </Box>
    );
}
