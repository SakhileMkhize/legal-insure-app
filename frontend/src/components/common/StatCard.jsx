import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function StatCard({ icon, label, value, accent = "primary" }) {
    return (
        <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor:
                            accent === "secondary"
                                ? "secondary.main"
                                : "primary.main",
                        color:
                            accent === "secondary"
                                ? "secondary.contrastText"
                                : "primary.contrastText",
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                        {value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {label}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
