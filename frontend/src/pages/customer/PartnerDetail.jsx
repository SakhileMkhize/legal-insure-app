import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { CATEGORY_MAP } from "../../utils/categoryMap";
import { API_URL } from "../../../global";

// Same helper as Partners.jsx (name -> two-letter avatar initial); kept
// local to each file rather than shared, since it's a one-liner.
function initialsOf(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function PartnerDetail() {
    // practitionerId comes from the /partners/:practitionerId route
    // segment (see App.jsx) rather than a prop.
    const { practitionerId } = useParams();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/partners/${practitionerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) =>
                response.ok
                    ? response.json()
                    : Promise.reject(new Error("Not found")),
            )
            .then(setPartner)
            .catch(() =>
                setError("We couldn't find that attorney's profile."),
            )
            .finally(() => setLoading(false));
    }, [practitionerId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !partner) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/partners")}
                sx={{ mb: 2 }}
            >
                Back to attorneys
            </Button>

            <Card variant="outlined">
                <CardContent sx={{ p: 4 }}>
                    <Stack
                        direction="row"
                        spacing={3}
                        sx={{ alignItems: "center", mb: 3, flexWrap: "wrap" }}
                    >
                        <Avatar
                            sx={{
                                width: 72,
                                height: 72,
                                bgcolor: "secondary.light",
                                color: "secondary.dark",
                                fontWeight: 700,
                                fontSize: "1.5rem",
                            }}
                        >
                            {initialsOf(partner.name)}
                        </Avatar>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 700 }}
                            >
                                {partner.displayName}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {partner.firm?.name}
                                {partner.practiceNumber
                                    ? ` · Practice No. ${partner.practiceNumber}`
                                    : ""}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ flexWrap: "wrap", gap: 0.75, mb: 3 }}
                    >
                        {partner.categories.map((categoryId) => (
                            <Chip
                                key={categoryId}
                                label={
                                    CATEGORY_MAP[categoryId]?.label ??
                                    categoryId
                                }
                            />
                        ))}
                    </Stack>

                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {partner.bio}
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                        {partner.email && (
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <EmailIcon
                                    fontSize="small"
                                    color="action"
                                />
                                <Typography variant="body2">
                                    {partner.email}
                                </Typography>
                            </Stack>
                        )}
                        {partner.phone && (
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <PhoneIcon
                                    fontSize="small"
                                    color="action"
                                />
                                <Typography variant="body2">
                                    {partner.phone}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>

                    {/* Firm details render only if the practitioner has
                        one on record — the API always includes it today,
                        but the field is nullable. */}
                    {partner.firm && (
                        <>
                            <Divider sx={{ mb: 3 }} />
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, mb: 1 }}
                            >
                                About {partner.firm.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                {partner.firm.bio}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                            >
                                {partner.firm.address}
                            </Typography>
                        </>
                    )}

                    {/* Carries this attorney's id to the booking form via
                        a query param, so Consultations.jsx can preselect
                        it instead of starting the picker empty. */}
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<EventAvailableIcon />}
                        sx={{ mt: 3 }}
                        onClick={() =>
                            navigate(`/consultations?practitioner=${partner.id}`)
                        }
                    >
                        Book a Consultation
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
