import Box from "@mui/material/Box";
import DescriptionIcon from "@mui/icons-material/Description";
import PaidIcon from "@mui/icons-material/Paid";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { StatCard } from "../../../../components/common/StatCard";

// Four glanceable totals, derived from the claims list already in state
// rather than fetched separately.
export function ClaimsSummaryStats({ claims }) {
    const totalClaimed = claims.reduce(
        (sum, claim) => sum + claim.amountClaimed,
        0,
    );
    const pendingCount = claims.filter(
        (claim) => claim.status === "pending" || claim.status === "in-review",
    ).length;
    const approvedCount = claims.filter(
        (claim) => claim.status === "approved",
    ).length;

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            <StatCard
                icon={<DescriptionIcon />}
                label="Total Claims"
                value={claims.length}
            />
            <StatCard
                icon={<PaidIcon />}
                label="Total Claimed"
                value={`R${totalClaimed.toLocaleString()}`}
                accent="secondary"
            />
            <StatCard
                icon={<PendingActionsIcon />}
                label="Pending Review"
                value={pendingCount}
            />
            <StatCard
                icon={<CheckCircleIcon />}
                label="Approved"
                value={approvedCount}
                accent="secondary"
            />
        </Box>
    );
}
