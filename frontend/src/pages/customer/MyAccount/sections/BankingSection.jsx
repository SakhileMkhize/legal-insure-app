import { useState } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EditIcon from "@mui/icons-material/Edit";
import { API_URL } from "../../../../../global";
import { authHeaders } from "../authHeaders";
import { PAYMENT_METHODS } from "../constants";

// Read-only summary of payment method/bank/masked account, with an edit
// icon that opens its own dialog.
export function BankingSection({ policy, onSaved, onError }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        paymentMethod: "",
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        branchCode: "",
    });
    const [saving, setSaving] = useState(false);

    // accountNumber always starts blank here - the API never returns the
    // real value (only a masked version), so there's nothing to seed it
    // with. Leaving it blank on save means "keep the existing account".
    const openDialog = () => {
        setForm({
            paymentMethod: policy.paymentMethod || "",
            bankName: policy.bankName || "",
            accountHolder: policy.accountHolder || "",
            accountNumber: "",
            branchCode: policy.branchCode || "",
        });
        setOpen(true);
    };

    const save = () => {
        setSaving(true);
        onError(null);
        fetch(`${API_URL}/policies/me/banking`, {
            method: "PATCH",
            headers: authHeaders(true),
            body: JSON.stringify(form),
        })
            .then((response) =>
                response
                    .json()
                    .then((data) =>
                        response.ok ? data : Promise.reject(new Error(data.message)),
                    ),
            )
            .then((data) => {
                onSaved(data);
                setOpen(false);
            })
            .catch((err) =>
                onError(err.message || "We couldn't save your banking details."),
            )
            .finally(() => setSaving(false));
    };

    return (
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
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <AccountBalanceIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Banking Details
                        </Typography>
                    </Stack>
                    <IconButton size="small" onClick={openDialog}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Stack>
                {policy.bankingOnFile ? (
                    <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Payment method
                            </Typography>
                            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                {(policy.paymentMethod || "").replace("_", " ") || "-"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Bank
                            </Typography>
                            <Typography variant="body2">
                                {policy.bankName || "-"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Account
                            </Typography>
                            <Typography variant="body2">
                                {policy.accountNumberMasked}
                            </Typography>
                        </Stack>
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No payment method on file yet - premium collection
                        can't start until this is set up.
                    </Typography>
                )}
            </CardContent>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Banking Details</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        {/* Reminds what's already on file, since the
                            account number field below never shows it. */}
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
                            value={form.paymentMethod}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    paymentMethod: e.target.value,
                                }))
                            }
                        >
                            {PAYMENT_METHODS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Bank Name"
                            fullWidth
                            value={form.bankName}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    bankName: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Account Holder"
                            fullWidth
                            value={form.accountHolder}
                            onChange={(e) =>
                                setForm((prev) => ({
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
                            value={form.accountNumber}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    accountNumber: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Branch Code"
                            fullWidth
                            value={form.branchCode}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    branchCode: e.target.value,
                                }))
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={saving}
                        onClick={save}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
