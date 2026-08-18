import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { StatusChip } from "../../../../components/common/StatusChip";
import { formatDateTime } from "../../../../utils/formatDate";

// Renders one titled list of consultation cards - reused for both the
// "Upcoming" and "Past" sections, which only differ in which consultations
// and empty-state copy they're given.
export function ConsultationGroup({ title, consultations, emptyText }) {
    return (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                {title}
            </Typography>
            {consultations.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    {emptyText}
                </Typography>
            )}
            <Stack spacing={2}>
                {consultations.map((consultation) => (
                    <Card key={consultation.id} variant="outlined">
                        <CardContent
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {consultation.lawyerName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDateTime(consultation.scheduledAt)} ·{" "}
                                    {consultation.notes}
                                </Typography>
                            </Box>
                            <StatusChip status={consultation.status} />
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}
