import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { StatCard } from "../../components/common/StatCard";
import { StatusChip } from "../../components/common/StatusChip";
import * as adminService from "../../services/adminService";
import * as claimService from "../../services/claimService";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getBusinessMetrics(),
      claimService.listAllClaims(),
      adminService.listClients(),
    ])
      .then(([metricsData, claimsData, clientsData]) => {
        setMetrics(metricsData);
        setRecentClaims(claimsData.slice(0, 5));
        setClients(clientsData.slice(0, 5));
      })
      .catch(() => setError("We couldn't load the admin overview right now."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Business Overview</Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <StatCard icon={<PeopleIcon />} label="Total Clients" value={metrics.totalClients} />
        <StatCard icon={<VerifiedUserIcon />} label="Active Policies" value={metrics.activePolicies} accent="secondary" />
        <StatCard icon={<PendingActionsIcon />} label="Pending Claims" value={metrics.pendingClaims} />
        <StatCard icon={<TrendingUpIcon />} label="Monthly Recurring Revenue" value={`R${metrics.mrr.toLocaleString()}`} accent="secondary" />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Card variant="outlined" sx={{ flex: "1 1 380px" }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Claims</Typography>
              <Button size="small" onClick={() => navigate("/admin/claims")}>View all</Button>
            </Stack>
            <Stack spacing={1.5}>
              {recentClaims.map((claim) => (
                <Stack key={claim.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{claim.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{claim.clientName}</Typography>
                  </Box>
                  <StatusChip status={claim.status} />
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: "1 1 380px" }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Clients</Typography>
              <Button size="small" onClick={() => navigate("/admin/clients")}>View all</Button>
            </Stack>
            <Stack spacing={1.5}>
              {clients.map((client) => (
                <Stack key={client.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {client.firstName} {client.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{client.planName}</Typography>
                  </Box>
                  <StatusChip status={client.policyStatus} />
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
