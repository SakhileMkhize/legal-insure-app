import Chip from "@mui/material/Chip";

const STATUS_COLORS = {
    active: "success",
    pending: "warning",
    "in-review": "info",
    approved: "success",
    rejected: "error",
    scheduled: "info",
    completed: "success",
    cancelled: "default",
    inactive: "default",
};

const STATUS_LABELS = {
    "in-review": "In Review",
};

function toLabel(status) {
    return (
        STATUS_LABELS[status] ??
        status.charAt(0).toUpperCase() + status.slice(1)
    );
}

export function StatusChip({ status, size = "small" }) {
    return (
        <Chip
            label={toLabel(status)}
            color={STATUS_COLORS[status] ?? "default"}
            size={size}
            variant={
                status === "inactive" || status === "cancelled"
                    ? "outlined"
                    : "filled"
            }
        />
    );
}
