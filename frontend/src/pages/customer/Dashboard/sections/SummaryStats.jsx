import Box from "@mui/material/Box";
import PaidIcon from "@mui/icons-material/Paid";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { StatCard } from "../../../../components/common/StatCard";

// Four glanceable numbers summarizing the account at a whole-page level;
// StatCard is the shared icon+value tile also used on the Admin Dashboard.
export function SummaryStats({ policy, openClaims, coverUsedLabel, unlimitedConsultations }) {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
            <StatCard
                icon={<PaidIcon />}
                label="Monthly Premium"
                value={`R${policy.monthlyPremium}`}
            />
            <StatCard
                icon={<DonutLargeIcon />}
                label="Cover Used"
                value={coverUsedLabel}
                accent="secondary"
            />
            <StatCard
                icon={<EventAvailableIcon />}
                label="Consultations Used"
                value={
                    unlimitedConsultations
                        ? policy.consultationsUsed
                        : `${policy.consultationsUsed}/${policy.consultationsIncluded}`
                }
            />
            <StatCard
                icon={<PendingActionsIcon />}
                label="Open Claims"
                value={openClaims}
                accent="secondary"
            />
        </Box>
    );
}
