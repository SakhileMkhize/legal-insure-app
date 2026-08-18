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
import WorkIcon from "@mui/icons-material/Work";
import EditIcon from "@mui/icons-material/Edit";
import { API_URL } from "../../../../../global";
import { authHeaders } from "../authHeaders";
import { EMPLOYMENT_STATUSES, MARITAL_STATUSES } from "../constants";

// Read-only summary of employer/occupation/marital status, with an edit
// icon that opens its own dialog - the dialog's form state is seeded from
// currentUser each time it's opened, and onSaved hands the parent the
// fresh record after a successful PATCH.
export function EmploymentSection({ currentUser, onSaved, onError }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        employerName: "",
        occupation: "",
        employmentStatus: "",
        maritalStatus: "",
    });
    const [saving, setSaving] = useState(false);

    const openDialog = () => {
        setForm({
            employerName: currentUser.employerName || "",
            occupation: currentUser.occupation || "",
            employmentStatus: currentUser.employmentStatus || "",
            maritalStatus: currentUser.maritalStatus || "",
        });
        setOpen(true);
    };

    const save = () => {
        setSaving(true);
        onError(null);
        fetch(`${API_URL}/auth/me`, {
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
                onError(err.message || "We couldn't save those details."),
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
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Employment
                        </Typography>
                    </Stack>
                    <IconButton size="small" onClick={openDialog}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Stack>
                {currentUser.employmentStatus || currentUser.employerName ? (
                    <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Status
                            </Typography>
                            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                {currentUser.employmentStatus || "-"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Employer
                            </Typography>
                            <Typography variant="body2">
                                {currentUser.employerName || "-"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Occupation
                            </Typography>
                            <Typography variant="body2">
                                {currentUser.occupation || "-"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                                Marital status
                            </Typography>
                            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                {currentUser.maritalStatus || "-"}
                            </Typography>
                        </Stack>
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Not on file yet - labour dispute claims are easier to
                        verify once we know your employer.
                    </Typography>
                )}
            </CardContent>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Employment &amp; Marital Status</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Employer Name"
                            fullWidth
                            value={form.employerName}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    employerName: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Occupation"
                            fullWidth
                            value={form.occupation}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    occupation: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            select
                            label="Employment Status"
                            fullWidth
                            value={form.employmentStatus}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    employmentStatus: e.target.value,
                                }))
                            }
                        >
                            {EMPLOYMENT_STATUSES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Marital Status"
                            fullWidth
                            value={form.maritalStatus}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    maritalStatus: e.target.value,
                                }))
                            }
                        >
                            {MARITAL_STATUSES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
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
