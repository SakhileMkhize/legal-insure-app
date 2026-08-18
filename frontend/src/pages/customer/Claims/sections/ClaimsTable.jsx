import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { ClaimRow } from "./ClaimRow";

// Table shell - each row's expand/collapse detail lives in ClaimRow, this
// component only owns the header and the row-by-row mapping.
export function ClaimsTable({
    claims,
    expandedId,
    onToggle,
    documentsByClaim,
    documentsLoading,
    uploadingId,
    onAttachEvidence,
}) {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell sx={{ fontWeight: 700 }}>Claim</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {claims.map((claim, index) => (
                        <ClaimRow
                            key={claim.id}
                            claim={claim}
                            index={index}
                            expanded={expandedId === claim.id}
                            onToggle={() => onToggle(claim.id)}
                            documents={documentsByClaim[claim.id] ?? []}
                            documentsLoading={Boolean(documentsLoading[claim.id])}
                            uploading={uploadingId === claim.id}
                            onAttachEvidence={(event) =>
                                onAttachEvidence(claim.id, event)
                            }
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
