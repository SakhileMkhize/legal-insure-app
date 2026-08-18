import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { StatusChip } from "../../../../components/common/StatusChip";
import { formatDate } from "../../../../utils/formatDate";

// Short preview of the three most recent claims, with a link through to
// the full Claims page.
export function RecentClaimsCard({ claims, navigate }) {
    return (
        <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
            <CardContent>
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Recent Claims
                    </Typography>
                    <Button size="small" onClick={() => navigate("/claims")}>
                        View all
                    </Button>
                </Stack>
                {claims.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        You haven't submitted any claims yet.
                    </Typography>
                )}
                <Stack spacing={0.5}>
                    {claims.slice(0, 3).map((claim) => (
                        <Stack
                            key={claim.id}
                            direction="row"
                            onClick={() => navigate("/claims")}
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 1,
                                mx: -1,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "action.hover" },
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                    noWrap
                                >
                                    {claim.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(claim.submittedAt)}
                                </Typography>
                            </Box>
                            <StatusChip status={claim.status} />
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
