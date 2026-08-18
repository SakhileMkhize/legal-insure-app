import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { CATEGORY_MAP } from "../../../../utils/categoryMap";
import { formatDate } from "../../../../utils/formatDate";

// Plan name/price, cover categories, and the policy-identity/POPIA-consent
// footer strip.
export function PlanSummaryCard({ policy, plan, navigate }) {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
            <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                <CardContent>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                        }}
                    >
                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Your Plan
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {plan?.name}
                            </Typography>
                        </Box>
                        <Chip
                            label={`R${policy.monthlyPremium}/month`}
                            color="secondary"
                        />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Active since {formatDate(policy.startDate)}
                    </Typography>

                    {/* Category chips only appear once cover has actually
                        been configured for this policy. */}
                    {policy.categoriesCovered?.length > 0 && (
                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.5 }}
                        >
                            {policy.categoriesCovered.map((categoryId) => (
                                <Chip
                                    key={categoryId}
                                    label={
                                        CATEGORY_MAP[categoryId]?.label ??
                                        categoryId
                                    }
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                        }}
                    >
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                            <VerifiedUserIcon
                                fontSize="inherit"
                                color={policy.popiaConsent ? "success" : "disabled"}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Policy {policy.id.slice(0, 8).toUpperCase()} ·
                                POPIA consent{" "}
                                {policy.popiaConsent ? "confirmed" : "pending"}
                            </Typography>
                        </Stack>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate("/plans")}
                        >
                            Manage Plan
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
