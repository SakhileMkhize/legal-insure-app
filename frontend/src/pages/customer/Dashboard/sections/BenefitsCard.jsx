import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import { BENEFIT_ICONS, getBenefitStatus } from "../constants";

// One row per perk, with a status chip and a "More Info" button that opens
// the dialog owned by the parent page.
export function BenefitsCard({ benefits, onSelectBenefit }) {
    return (
        <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Your Benefits
                </Typography>
                <Stack divider={<Divider />} spacing={1.5}>
                    {benefits.map((benefit) => {
                        const Icon = BENEFIT_ICONS[benefit.id] ?? GavelIcon;
                        const status = getBenefitStatus(benefit);
                        return (
                            <Stack
                                key={benefit.id}
                                direction="row"
                                spacing={{ xs: 1.5, sm: 2 }}
                                sx={{
                                    alignItems: "center",
                                    py: 0.5,
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1.5,
                                        bgcolor: "secondary.light",
                                        color: "secondary.dark",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Icon fontSize="small" />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 180 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {benefit.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {benefit.usageLimitCount === 1
                                            ? status.label
                                            : benefit.usageLimitCount != null
                                              ? `${benefit.usedCount} of ${benefit.usageLimitCount} used`
                                              : status.label}
                                    </Typography>
                                </Box>
                                <Chip
                                    size="small"
                                    label={status.label}
                                    color={
                                        status.color === "default"
                                            ? undefined
                                            : status.color
                                    }
                                    variant={
                                        status.color === "success"
                                            ? "outlined"
                                            : "filled"
                                    }
                                />
                                <Button
                                    size="small"
                                    startIcon={<InfoOutlinedIcon fontSize="small" />}
                                    onClick={() => onSelectBenefit(benefit)}
                                >
                                    More Info
                                </Button>
                            </Stack>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
}
