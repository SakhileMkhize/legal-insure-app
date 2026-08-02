import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GavelIcon from "@mui/icons-material/Gavel";
import BalanceIcon from "@mui/icons-material/Balance";
import ShieldIcon from "@mui/icons-material/Shield";

const ICONS = {
    ShieldIcon,
    BalanceIcon,
    GavelIcon,
};

export function PlanCard({
    plan,
    selected = false,
    compact = false,
    onSelect,
    actionLabel = "Get Started",
}) {
    const Icon = ICONS[plan.icon] ?? ShieldIcon;

    return (
        <Card
            variant="outlined"
            sx={{
                flex: 1,
                minWidth: 260,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderColor: selected
                    ? "secondary.main"
                    : plan.popular
                      ? "primary.main"
                      : "divider",
                borderWidth: selected || plan.popular ? 2 : 1,
                cursor: onSelect ? "pointer" : "default",
            }}
            onClick={onSelect ? () => onSelect(plan.id) : undefined}
        >
            {plan.popular && (
                <Chip
                    label="Most Popular"
                    color="secondary"
                    size="small"
                    sx={{ position: "absolute", top: 16, right: 16 }}
                />
            )}
            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    flexGrow: 1,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {plan.name}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                    {plan.tagline}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        R{plan.monthlyPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        / month
                    </Typography>
                </Box>

                {!compact && (
                    <List dense disablePadding sx={{ mt: 1 }}>
                        {plan.features.map((feature) => (
                            <ListItem
                                key={feature}
                                disableGutters
                                sx={{ py: 0.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircleIcon
                                        color="success"
                                        fontSize="small"
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primaryTypographyProps={{
                                        variant: "body2",
                                    }}
                                    primary={feature}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {onSelect && (
                    <Button
                        variant={selected ? "contained" : "outlined"}
                        color={selected ? "secondary" : "primary"}
                        fullWidth
                        sx={{ mt: "auto" }}
                    >
                        {selected ? "Selected" : actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
