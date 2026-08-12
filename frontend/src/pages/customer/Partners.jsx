import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { CATEGORY_MAP } from "../../utils/categoryMap";
import { API_URL } from "../../../global";

function initialsOf(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function Partners() {
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const query = category ? `?category=${category}` : "";
        fetch(`${API_URL}/partners/${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then(setPartners)
            .catch(() =>
                setError("We couldn't load our attorney network right now."),
            )
            .finally(() => setLoading(false));
    }, [category]);

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Find an Attorney
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The law firms and practitioners LegalInsure works with —
                compare specializations before you book a consultation.
            </Typography>

            <TextField
                select
                label="Filter by specialization"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ mb: 3, minWidth: 260 }}
            >
                <MenuItem value="">All specializations</MenuItem>
                {COVER_CATEGORIES.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                        {c.label}
                    </MenuItem>
                ))}
            </TextField>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && partners.length === 0 && (
                <Alert severity="info">
                    No attorneys match that specialization right now.
                </Alert>
            )}

            {!loading && !error && partners.length > 0 && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "1fr 1fr 1fr",
                        },
                        gap: 3,
                    }}
                >
                    {partners.map((partner) => (
                        <Card key={partner.id} variant="outlined">
                            <CardContent>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{ alignItems: "center", mb: 1.5 }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: "secondary.light",
                                            color: "secondary.dark",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {initialsOf(partner.name)}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700 }}
                                            noWrap
                                        >
                                            {partner.displayName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            noWrap
                                        >
                                            {partner.firm?.name}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    sx={{ flexWrap: "wrap", gap: 0.75, mb: 1.5 }}
                                >
                                    {partner.categories.map((categoryId) => (
                                        <Chip
                                            key={categoryId}
                                            size="small"
                                            label={
                                                CATEGORY_MAP[categoryId]
                                                    ?.label ?? categoryId
                                            }
                                        />
                                    ))}
                                </Stack>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {partner.bio}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() =>
                                        navigate(`/partners/${partner.id}`)
                                    }
                                >
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}
