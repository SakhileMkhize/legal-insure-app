import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WorkIcon from "@mui/icons-material/Work";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HistoryIcon from "@mui/icons-material/History";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import { PLANS } from "../../data/mockPlans";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { CATEGORY_MAP } from "../../utils/categoryMap";
import { formatDate } from "../../utils/formatDate";
import { API_URL } from "../../../global";

const EMPLOYMENT_STATUSES = [
    { value: "employed", label: "Employed" },
    { value: "self-employed", label: "Self-employed" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
    { value: "student", label: "Student" },
];

const MARITAL_STATUSES = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
];

const PAYMENT_METHODS = [
    { value: "debit_order", label: "Debit Order" },
    { value: "eft", label: "EFT" },
    { value: "card", label: "Card" },
];

function authHeaders(json = false) {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
}

export function MyAccount() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [legalHistory, setLegalHistory] = useState([]);
    const [nextOfKin, setNextOfKin] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);

    const [employmentOpen, setEmploymentOpen] = useState(false);
    const [employmentForm, setEmploymentForm] = useState({
        employerName: "",
        occupation: "",
        employmentStatus: "",
        maritalStatus: "",
    });
    const [employmentSaving, setEmploymentSaving] = useState(false);

    const [bankingOpen, setBankingOpen] = useState(false);
    const [bankingForm, setBankingForm] = useState({
        paymentMethod: "",
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        branchCode: "",
    });
    const [bankingSaving, setBankingSaving] = useState(false);

    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyForm, setHistoryForm] = useState({
        category: "",
        description: "",
        occurredAt: "",
        wasInsuredClaim: false,
        otherInsurer: "",
    });
    const [historySaving, setHistorySaving] = useState(false);

    const [kinOpen, setKinOpen] = useState(false);
    const [kinForm, setKinForm] = useState({
        name: "",
        relationship: "",
        phone: "",
        email: "",
    });
    const [kinSaving, setKinSaving] = useState(false);

    const loadAll = () => {
        setLoading(true);
        setError(null);
        Promise.all([
            fetch(`${API_URL}/auth/me`, { headers: authHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/policies/me`, { headers: authHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/auth/me/legal-history`, { headers: authHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/auth/me/next-of-kin`, { headers: authHeaders() }).then((r) => r.json()),
        ])
            .then(([userData, policyData, historyData, kinData]) => {
                setCurrentUser(userData);
                setPolicy(policyData);
                setLegalHistory(Array.isArray(historyData) ? historyData : []);
                setNextOfKin(Array.isArray(kinData) ? kinData : []);
            })
            .catch(() => setError("We couldn't load your account right now."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const plan = policy ? PLANS.find((p) => p.id === policy.planId) : null;

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const openEmploymentDialog = () => {
        setEmploymentForm({
            employerName: currentUser.employerName || "",
            occupation: currentUser.occupation || "",
            employmentStatus: currentUser.employmentStatus || "",
            maritalStatus: currentUser.maritalStatus || "",
        });
        setEmploymentOpen(true);
    };

    const saveEmployment = () => {
        setEmploymentSaving(true);
        setActionError(null);
        fetch(`${API_URL}/auth/me`, {
            method: "PATCH",
            headers: authHeaders(true),
            body: JSON.stringify(employmentForm),
        })
            .then((response) =>
                response
                    .json()
                    .then((data) =>
                        response.ok ? data : Promise.reject(new Error(data.message)),
                    ),
            )
            .then((data) => {
                setCurrentUser(data);
                setEmploymentOpen(false);
            })
            .catch((err) =>
                setActionError(err.message || "We couldn't save those details."),
            )
            .finally(() => setEmploymentSaving(false));
    };

    const openBankingDialog = () => {
        setBankingForm({
            paymentMethod: policy.paymentMethod || "",
            bankName: policy.bankName || "",
            accountHolder: policy.accountHolder || "",
            accountNumber: "",
            branchCode: policy.branchCode || "",
        });
        setBankingOpen(true);
    };

    const saveBanking = () => {
        setBankingSaving(true);
        setActionError(null);
        fetch(`${API_URL}/policies/me/banking`, {
            method: "PATCH",
            headers: authHeaders(true),
            body: JSON.stringify(bankingForm),
        })
            .then((response) =>
                response
                    .json()
                    .then((data) =>
                        response.ok ? data : Promise.reject(new Error(data.message)),
                    ),
            )
            .then((data) => {
                setPolicy(data);
                setBankingOpen(false);
            })
            .catch((err) =>
                setActionError(err.message || "We couldn't save your banking details."),
            )
            .finally(() => setBankingSaving(false));
    };

    const saveHistoryEntry = () => {
        setHistorySaving(true);
        setActionError(null);
        fetch(`${API_URL}/auth/me/legal-history`, {
            method: "POST",
            headers: authHeaders(true),
            body: JSON.stringify(historyForm),
        })
            .then((response) =>
                response
                    .json()
                    .then((data) =>
                        response.ok ? data : Promise.reject(new Error(data.message)),
                    ),
            )
            .then((entry) => {
                setLegalHistory((prev) => [entry, ...prev]);
                setHistoryOpen(false);
                setHistoryForm({
                    category: "",
                    description: "",
                    occurredAt: "",
                    wasInsuredClaim: false,
                    otherInsurer: "",
                });
            })
            .catch((err) =>
                setActionError(err.message || "We couldn't save that entry."),
            )
            .finally(() => setHistorySaving(false));
    };

    const saveNextOfKin = () => {
        setKinSaving(true);
        setActionError(null);
        fetch(`${API_URL}/auth/me/next-of-kin`, {
            method: "POST",
            headers: authHeaders(true),
            body: JSON.stringify(kinForm),
        })
            .then((response) =>
                response
                    .json()
                    .then((data) =>
                        response.ok ? data : Promise.reject(new Error(data.message)),
                    ),
            )
            .then((contact) => {
                setNextOfKin((prev) => [...prev, contact]);
                setKinOpen(false);
                setKinForm({ name: "", relationship: "", phone: "", email: "" });
            })
            .catch((err) =>
                setActionError(err.message || "We couldn't save that contact."),
            )
            .finally(() => setKinSaving(false));
    };

    const removeNextOfKin = (contactId) => {
        setActionError(null);
        fetch(`${API_URL}/auth/me/next-of-kin/${contactId}`, {
            method: "DELETE",
            headers: authHeaders(),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Contact was not removed");
                setNextOfKin((prev) => prev.filter((c) => c.id !== contactId));
            })
            .catch(() => setActionError("We couldn't remove that contact."));
    };

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
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                My Account
            </Typography>

            {actionError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setActionError(null)}
                >
                    {actionError}
                </Alert>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center", mb: 2 }}
                        >
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: "secondary.main",
                                    color: "primary.main",
                                    fontWeight: 700,
                                }}
                            >
                                {currentUser.firstName[0]}
                                {currentUser.lastName[0]}
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {currentUser.firstName}{" "}
                                    {currentUser.lastName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {currentUser.email}
                                </Typography>
                            </Box>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={1.5}>
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
                                    {currentUser.phone}
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
                                    Address
                                </Typography>
                                <Typography variant="body2">
                                    {currentUser.address || "Not set"}
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
                                    Client since
                                </Typography>
                                <Typography variant="body2">
                                    {formatDate(currentUser.joinedAt)}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            sx={{ mt: 3 }}
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 2 }}
                        >
                            Current Plan
                        </Typography>
                        {plan && (
                            <>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {plan.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    R{plan.monthlyPrice}/month - {plan.tagline}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => navigate("/plans")}
                                >
                                    Change Plan
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <WorkIcon fontSize="small" color="action" />
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Employment
                                </Typography>
                            </Stack>
                            <IconButton
                                size="small"
                                onClick={openEmploymentDialog}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        {currentUser.employmentStatus ||
                            currentUser.employerName ? (
                            <Stack spacing={1}>
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
                                    <Typography
                                        variant="body2"
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {currentUser.employmentStatus || "-"}
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
                                        Employer
                                    </Typography>
                                    <Typography variant="body2">
                                        {currentUser.employerName || "-"}
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
                                        Occupation
                                    </Typography>
                                    <Typography variant="body2">
                                        {currentUser.occupation || "-"}
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
                                        Marital status
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {currentUser.maritalStatus || "-"}
                                    </Typography>
                                </Stack>
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Not on file yet - labour dispute claims are
                                easier to verify once we know your employer.
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <AccountBalanceIcon
                                    fontSize="small"
                                    color="action"
                                />
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Banking Details
                                </Typography>
                            </Stack>
                            <IconButton
                                size="small"
                                onClick={openBankingDialog}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        {policy.bankingOnFile ? (
                            <Stack spacing={1}>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Payment method
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {(
                                            policy.paymentMethod || ""
                                        ).replace("_", " ") || "-"}
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
                                        Bank
                                    </Typography>
                                    <Typography variant="body2">
                                        {policy.bankName || "-"}
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
                                        Account
                                    </Typography>
                                    <Typography variant="body2">
                                        {policy.accountNumberMasked}
                                    </Typography>
                                </Stack>
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No payment method on file yet - premium
                                collection can't start until this is set up.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <HistoryIcon fontSize="small" color="action" />
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Legal History
                                </Typography>
                            </Stack>
                            <Button
                                size="small"
                                startIcon={<AddIcon fontSize="small" />}
                                onClick={() => setHistoryOpen(true)}
                            >
                                Add
                            </Button>
                        </Stack>
                        {legalHistory.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No disputes disclosed. Add anything relevant
                                - past claims, ongoing matters - so we can
                                assess cover accurately.
                            </Typography>
                        )}
                        <Stack spacing={1.5}>
                            {legalHistory.map((entry) => (
                                <Box key={entry.id}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {entry.category && (
                                            <Chip
                                                size="small"
                                                label={
                                                    CATEGORY_MAP[
                                                        entry.category
                                                    ]?.label ?? entry.category
                                                }
                                            />
                                        )}
                                        {entry.wasInsuredClaim && (
                                            <Chip
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                                label={
                                                    entry.otherInsurer
                                                        ? `Claimed via ${entry.otherInsurer}`
                                                        : "Previously insured claim"
                                                }
                                            />
                                        )}
                                        {entry.occurredAt && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formatDate(entry.occurredAt)}
                                            </Typography>
                                        )}
                                    </Stack>
                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {entry.description}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
                    <CardContent>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <ContactPhoneIcon
                                    fontSize="small"
                                    color="action"
                                />
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Next of Kin
                                </Typography>
                            </Stack>
                            <Button
                                size="small"
                                startIcon={<AddIcon fontSize="small" />}
                                onClick={() => setKinOpen(true)}
                            >
                                Add
                            </Button>
                        </Stack>
                        {nextOfKin.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No emergency contact on file.
                            </Typography>
                        )}
                        <Stack spacing={1}>
                            {nextOfKin.map((contact) => (
                                <Stack
                                    key={contact.id}
                                    direction="row"
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {contact.name}{" "}
                                            {contact.relationship && (
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    ({contact.relationship})
                                                </Typography>
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {contact.phone}
                                            {contact.email
                                                ? ` · ${contact.email}`
                                                : ""}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            removeNextOfKin(contact.id)
                                        }
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            <Dialog
                open={employmentOpen}
                onClose={() => setEmploymentOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Employment & Marital Status</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Employer Name"
                            fullWidth
                            value={employmentForm.employerName}
                            onChange={(e) =>
                                setEmploymentForm((prev) => ({
                                    ...prev,
                                    employerName: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Occupation"
                            fullWidth
                            value={employmentForm.occupation}
                            onChange={(e) =>
                                setEmploymentForm((prev) => ({
                                    ...prev,
                                    occupation: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            select
                            label="Employment Status"
                            fullWidth
                            value={employmentForm.employmentStatus}
                            onChange={(e) =>
                                setEmploymentForm((prev) => ({
                                    ...prev,
                                    employmentStatus: e.target.value,
                                }))
                            }
                        >
                            {EMPLOYMENT_STATUSES.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Marital Status"
                            fullWidth
                            value={employmentForm.maritalStatus}
                            onChange={(e) =>
                                setEmploymentForm((prev) => ({
                                    ...prev,
                                    maritalStatus: e.target.value,
                                }))
                            }
                        >
                            {MARITAL_STATUSES.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setEmploymentOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={employmentSaving}
                        onClick={saveEmployment}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={bankingOpen}
                onClose={() => setBankingOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Banking Details</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        {policy.bankingOnFile && (
                            <Alert severity="info" variant="outlined">
                                Account on file: {policy.accountNumberMasked}.
                                Leave the account number blank below to keep
                                it unchanged.
                            </Alert>
                        )}
                        <TextField
                            select
                            label="Payment Method"
                            fullWidth
                            value={bankingForm.paymentMethod}
                            onChange={(e) =>
                                setBankingForm((prev) => ({
                                    ...prev,
                                    paymentMethod: e.target.value,
                                }))
                            }
                        >
                            {PAYMENT_METHODS.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Bank Name"
                            fullWidth
                            value={bankingForm.bankName}
                            onChange={(e) =>
                                setBankingForm((prev) => ({
                                    ...prev,
                                    bankName: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Account Holder"
                            fullWidth
                            value={bankingForm.accountHolder}
                            onChange={(e) =>
                                setBankingForm((prev) => ({
                                    ...prev,
                                    accountHolder: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Account Number"
                            fullWidth
                            placeholder={
                                policy.bankingOnFile
                                    ? "Leave blank to keep current account"
                                    : ""
                            }
                            value={bankingForm.accountNumber}
                            onChange={(e) =>
                                setBankingForm((prev) => ({
                                    ...prev,
                                    accountNumber: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Branch Code"
                            fullWidth
                            value={bankingForm.branchCode}
                            onChange={(e) =>
                                setBankingForm((prev) => ({
                                    ...prev,
                                    branchCode: e.target.value,
                                }))
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setBankingOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={bankingSaving}
                        onClick={saveBanking}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Disclose Legal History</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            select
                            label="Category (optional)"
                            fullWidth
                            value={historyForm.category}
                            onChange={(e) =>
                                setHistoryForm((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                }))
                            }
                        >
                            <MenuItem value="">Not applicable</MenuItem>
                            {COVER_CATEGORIES.map((category) => (
                                <MenuItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                            value={historyForm.description}
                            onChange={(e) =>
                                setHistoryForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="When did this occur?"
                            type="date"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={historyForm.occurredAt}
                            onChange={(e) =>
                                setHistoryForm((prev) => ({
                                    ...prev,
                                    occurredAt: e.target.value,
                                }))
                            }
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={historyForm.wasInsuredClaim}
                                    onChange={(e) =>
                                        setHistoryForm((prev) => ({
                                            ...prev,
                                            wasInsuredClaim:
                                                e.target.checked,
                                        }))
                                    }
                                />
                            }
                            label="This was claimed against another insurer"
                        />
                        {historyForm.wasInsuredClaim && (
                            <TextField
                                label="Which insurer?"
                                fullWidth
                                value={historyForm.otherInsurer}
                                onChange={(e) =>
                                    setHistoryForm((prev) => ({
                                        ...prev,
                                        otherInsurer: e.target.value,
                                    }))
                                }
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setHistoryOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={
                            historySaving || !historyForm.description.trim()
                        }
                        onClick={saveHistoryEntry}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={kinOpen}
                onClose={() => setKinOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add Next of Kin</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={kinForm.name}
                            onChange={(e) =>
                                setKinForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Relationship"
                            fullWidth
                            value={kinForm.relationship}
                            onChange={(e) =>
                                setKinForm((prev) => ({
                                    ...prev,
                                    relationship: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Phone"
                            fullWidth
                            value={kinForm.phone}
                            onChange={(e) =>
                                setKinForm((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Email (optional)"
                            fullWidth
                            value={kinForm.email}
                            onChange={(e) =>
                                setKinForm((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setKinOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={
                            kinSaving ||
                            !kinForm.name.trim() ||
                            !kinForm.phone.trim()
                        }
                        onClick={saveNextOfKin}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
