import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { StatusChip } from "../../components/common/StatusChip";
import * as claimService from "../../services/claimService";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadClaims = () => {
    setLoading(true);
    setError(null);
    claimService
      .listAllClaims()
      .then(setClaims)
      .catch(() => setError("We couldn't load claims right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const filteredClaims = useMemo(() => {
    if (tab === "all") return claims;
    if (tab === "pending") return claims.filter((c) => c.status === "pending" || c.status === "in-review");
    return claims.filter((c) => c.status === tab);
  }, [claims, tab]);

  const handleDecision = (claimId, status) => {
    setActionError(null);
    claimService
      .updateClaimStatus(claimId, status)
      .then(loadClaims)
      .catch(() => setActionError("We couldn't update this claim. Please try again."));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Claims Management</Typography>

      <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
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
              {filteredClaims.map((claim) => {
                const decided = claim.status === "approved" || claim.status === "rejected";
                return (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.clientName}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{claim.category}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setSelectedClaim(claim)}>{claim.title}</Button>
                    </TableCell>
                    <TableCell align="right">R{claim.amountClaimed.toLocaleString()}</TableCell>
                    <TableCell>{claim.submittedAt}</TableCell>
                    <TableCell><StatusChip status={claim.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Approve">
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            disabled={decided}
                            onClick={() => handleDecision(claim.id, "approved")}
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
                            onClick={() => handleDecision(claim.id, "rejected")}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredClaims.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No claims in this category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(selectedClaim)} onClose={() => setSelectedClaim(null)} fullWidth maxWidth="sm">
        {selectedClaim && (
          <>
            <DialogTitle>{selectedClaim.title}</DialogTitle>
            <DialogContent>
              <Stack spacing={1.5}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Claimant</Typography>
                  <Typography variant="body2">{selectedClaim.clientName}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body2" sx={{ textTransform: "capitalize" }}>{selectedClaim.category}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Amount Claimed</Typography>
                  <Typography variant="body2">R{selectedClaim.amountClaimed.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <StatusChip status={selectedClaim.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Description</Typography>
                <Typography variant="body2">{selectedClaim.description}</Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedClaim(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
