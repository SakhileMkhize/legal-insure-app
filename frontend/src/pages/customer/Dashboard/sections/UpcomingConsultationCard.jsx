import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { formatDateTime } from "../../../../utils/formatDate";

// Next scheduled consultation, if any, with a shortcut to book another.
export function UpcomingConsultationCard({ upcomingConsultation, navigate }) {
    return (
        <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
            <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Upcoming Consultation
                </Typography>
                {upcomingConsultation ? (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {upcomingConsultation.lawyerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formatDateTime(upcomingConsultation.scheduledAt)}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No upcoming consultations.
                    </Typography>
                )}
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/consultations")}
                >
                    Book Consultation
                </Button>
            </CardContent>
        </Card>
    );
}
