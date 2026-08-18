import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChatIcon from "@mui/icons-material/Chat";
import ArticleIcon from "@mui/icons-material/Article";

// Shortcuts to the same destinations reachable elsewhere in the app, plus
// two still-unbuilt placeholders (disabled): "Ask AI Assistant" and the
// policy-summary download.
export function QuickActionsCard({ navigate }) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Quick Actions
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DescriptionIcon />}
                        onClick={() => navigate("/claims")}
                    >
                        Submit a Claim
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<EventAvailableIcon />}
                        onClick={() => navigate("/consultations")}
                    >
                        Book Consultation
                    </Button>
                    <Button variant="outlined" startIcon={<ChatIcon />} disabled>
                        Ask AI Assistant
                    </Button>
                    <Button variant="outlined" startIcon={<ArticleIcon />} disabled>
                        Download Policy Summary
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
