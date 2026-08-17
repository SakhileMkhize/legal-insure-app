import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { StatusChip } from "../../components/common/StatusChip";
import { formatDate } from "../../utils/formatDate";
import { API_URL } from "../../../global";

export function AdminClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/admin/clients`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then(setClients)
            .catch(() => setError("We couldn't load clients right now."))
            .finally(() => setLoading(false));
    }, []);

    // Search and pagination are both applied client-side against the full client list already loaded
    const filteredClients = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return clients;
        return clients.filter(
            (client) =>
                `${client.firstName} ${client.lastName}`
                    .toLowerCase()
                    .includes(term) ||
                client.email.toLowerCase().includes(term),
        );
    }, [clients, search]);

    const paginatedClients = filteredClients.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Clients
            </Typography>

            {/* Resets to page 0 on every search change, so a filtered
                result set never opens on a now-empty later page. */}
            <TextField
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                }}
                size="small"
                sx={{ mb: 3, maxWidth: 360 }}
                fullWidth
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
            />

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
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Plan</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedClients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        {client.firstName} {client.lastName}
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.planName}</TableCell>
                                    <TableCell>
                                        <StatusChip
                                            status={client.policyStatus}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(client.joinedAt)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            onClick={() =>
                                                setSelectedClient(client)
                                            }
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedClients.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        align="center"
                                        sx={{ py: 4 }}
                                    >
                                        No clients match your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {/* count uses the filtered total, not the full client
                        list, so page numbers stay correct while searching. */}
                    <TablePagination
                        component="div"
                        count={filteredClients.length}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </TableContainer>
            )}

            {/* Read-only detail dialog for whichever client's "View"
                button was clicked. */}
            <Dialog
                open={Boolean(selectedClient)}
                onClose={() => setSelectedClient(null)}
                fullWidth
                maxWidth="xs"
            >
                {selectedClient && (
                    <>
                        <DialogTitle>
                            {selectedClient.firstName} {selectedClient.lastName}
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={1.5}>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Email
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedClient.email}
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Phone
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedClient.phone}
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Plan
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedClient.planName}
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Premium
                                    </Typography>
                                    <Typography variant="body2">
                                        R{selectedClient.monthlyPremium}/month
                                    </Typography>
                                </Stack>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Status
                                    </Typography>
                                    <StatusChip
                                        status={selectedClient.policyStatus}
                                    />
                                </Stack>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Joined
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDate(selectedClient.joinedAt)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedClient(null)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
