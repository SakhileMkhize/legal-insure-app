import { Fragment } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { StatusChip } from "../../../../components/common/StatusChip";
import { CATEGORY_MAP } from "../../../../utils/categoryMap";
import { formatDate } from "../../../../utils/formatDate";
import { downloadAuthenticatedFile } from "../../../../utils/downloadFile";
import { API_URL } from "../../../../../global";

// One claim's summary row plus its expandable detail (description,
// evidence list, attach control) - two <TableRow>s in a Fragment so the
// Collapse can span the full table width beneath the summary row.
export function ClaimRow({
    claim,
    index,
    expanded,
    onToggle,
    documents,
    documentsLoading,
    uploading,
    onAttachEvidence,
}) {
    const category = CATEGORY_MAP[claim.category];

    return (
        <Fragment>
            {/* Zebra striping by row index, plus a border removed while
                expanded so it visually joins the Collapse row beneath it. */}
            <TableRow
                hover
                onClick={onToggle}
                sx={{
                    cursor: "pointer",
                    backgroundColor:
                        index % 2 === 1 ? "action.hover" : "transparent",
                    "& > .MuiTableCell-root": {
                        py: 1.75,
                        borderBottom: expanded ? "none" : undefined,
                    },
                }}
            >
                <TableCell>
                    <IconButton
                        size="small"
                        sx={{
                            transform: expanded ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s",
                        }}
                    >
                        <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {claim.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {category?.label ?? claim.category}
                    </Typography>
                </TableCell>
                <TableCell>{formatDate(claim.submittedAt)}</TableCell>
                <TableCell align="right">
                    R{claim.amountClaimed.toLocaleString()}
                </TableCell>
                <TableCell>
                    <StatusChip status={claim.status} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    colSpan={5}
                    sx={{ py: 0, borderBottom: expanded ? undefined : "none" }}
                >
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, pl: { xs: 0, sm: 7 }, pr: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {claim.description}
                            </Typography>
                            {claim.decidedAt && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", mt: 1 }}
                                >
                                    Decided {formatDate(claim.decidedAt)}
                                </Typography>
                            )}

                            <Divider sx={{ my: 1.5 }} />

                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                                >
                                    EVIDENCE
                                </Typography>
                                <Button
                                    size="small"
                                    component="label"
                                    startIcon={<AttachFileIcon fontSize="small" />}
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading…" : "Attach evidence"}
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={onAttachEvidence}
                                    />
                                </Button>
                            </Stack>

                            {documentsLoading && <CircularProgress size={16} />}
                            {!documentsLoading && documents.length === 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    No documents attached yet.
                                </Typography>
                            )}
                            <Stack spacing={0.5}>
                                {documents.map((doc) => (
                                    <Stack
                                        key={doc.id}
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <InsertDriveFileIcon
                                            fontSize="small"
                                            color="action"
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ flex: 1 }}
                                            noWrap
                                        >
                                            {doc.fileName}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                downloadAuthenticatedFile(
                                                    `${API_URL}/claims/documents/${doc.id}/download`,
                                                    doc.fileName,
                                                )
                                            }
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}
