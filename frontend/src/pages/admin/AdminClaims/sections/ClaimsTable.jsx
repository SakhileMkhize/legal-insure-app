import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { StatusChip } from "../../../../components/common/StatusChip";
import { formatDate } from "../../../../utils/formatDate";

// One row per claim, with inline approve/reject actions - a decision isn't
// reversible from this table, so both buttons disable once a claim already
// has a final status.
export function ClaimsTable({ claims, onSelect, onDecision }) {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Claimant</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {claims.map((claim) => {
                        const decided =
                            claim.status === "approved" ||
                            claim.status === "rejected";
                        return (
                            <TableRow key={claim.id}>
                                <TableCell>{claim.clientName}</TableCell>
                                <TableCell sx={{ textTransform: "capitalize" }}>
                                    {claim.category}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => onSelect(claim)}
                                    >
                                        {claim.title}
                                    </Button>
                                </TableCell>
                                <TableCell align="right">
                                    R{claim.amountClaimed.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {formatDate(claim.submittedAt)}
                                </TableCell>
                                <TableCell>
                                    <StatusChip status={claim.status} />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Approve">
                                        <span>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                disabled={decided}
                                                onClick={() =>
                                                    onDecision(
                                                        claim.id,
                                                        "approved",
                                                    )
                                                }
                                            >
                                                <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Reject">
                                        <span>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                disabled={decided}
                                                onClick={() =>
                                                    onDecision(
                                                        claim.id,
                                                        "rejected",
                                                    )
                                                }
                                            >
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {claims.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                No claims in this category.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
