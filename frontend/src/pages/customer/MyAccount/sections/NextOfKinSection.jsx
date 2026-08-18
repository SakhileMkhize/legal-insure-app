import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from "../../../../../global";
import { authHeaders } from "../authHeaders";

const EMPTY_FORM = { name: "", relationship: "", phone: "", email: "" };

// A list of emergency contacts, with an "Add" dialog and inline delete.
export function NextOfKinSection({ nextOfKin, onAdded, onRemoved, onError }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        onError(null);
        fetch(`${API_URL}/auth/me/next-of-kin`, {
            method: "POST",
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
            .then((contact) => {
                onAdded(contact);
                setOpen(false);
                setForm(EMPTY_FORM);
            })
            .catch((err) =>
                onError(err.message || "We couldn't save that contact."),
            )
            .finally(() => setSaving(false));
    };

    const remove = (contactId) => {
        onError(null);
        fetch(`${API_URL}/auth/me/next-of-kin/${contactId}`, {
            method: "DELETE",
            headers: authHeaders(),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Contact was not removed");
                onRemoved(contactId);
            })
            .catch(() => onError("We couldn't remove that contact."));
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
                        <ContactPhoneIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Next of Kin
                        </Typography>
                    </Stack>
                    <Button
                        size="small"
                        startIcon={<AddIcon fontSize="small" />}
                        onClick={() => setOpen(true)}
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
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                                <Typography variant="caption" color="text.secondary">
                                    {contact.phone}
                                    {contact.email ? ` · ${contact.email}` : ""}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => remove(contact.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Next of Kin</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={form.name}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                        <TextField
                            label="Relationship"
                            fullWidth
                            value={form.relationship}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    relationship: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Phone"
                            fullWidth
                            value={form.phone}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                        />
                        <TextField
                            label="Email (optional)"
                            fullWidth
                            value={form.email}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={saving || !form.name.trim() || !form.phone.trim()}
                        onClick={save}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
