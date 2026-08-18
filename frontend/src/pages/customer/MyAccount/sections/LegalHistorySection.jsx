import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
import { CATEGORY_MAP } from "../../../../utils/categoryMap";
import { formatDate } from "../../../../utils/formatDate";
import { API_URL } from "../../../../../global";
import { authHeaders } from "../authHeaders";

const EMPTY_FORM = {
    category: "",
    description: "",
    occurredAt: "",
    wasInsuredClaim: false,
    otherInsurer: "",
};

// A list of previously disclosed disputes, with an "Add" button that
// opens a dialog for disclosing one more.
export function LegalHistorySection({ legalHistory, onAdded, onError }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        onError(null);
        fetch(`${API_URL}/auth/me/legal-history`, {
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
            .then((entry) => {
                onAdded(entry);
                setOpen(false);
                setForm(EMPTY_FORM);
            })
            .catch((err) =>
                onError(err.message || "We couldn't save that entry."),
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
                        <HistoryIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Legal History
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
                {legalHistory.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No disputes disclosed. Add anything relevant - past
                        claims, ongoing matters - so cover can be assessed
                        accurately.
                    </Typography>
                )}
                <Stack spacing={1.5}>
                    {legalHistory.map((entry) => (
                        <Box key={entry.id}>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center", flexWrap: "wrap" }}
                            >
                                {entry.category && (
                                    <Chip
                                        size="small"
                                        label={
                                            CATEGORY_MAP[entry.category]?.label ??
                                            entry.category
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
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(entry.occurredAt)}
                                    </Typography>
                                )}
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {entry.description}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </CardContent>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Disclose Legal History</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            select
                            label="Category (optional)"
                            fullWidth
                            value={form.category}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                }))
                            }
                        >
                            <MenuItem value="">Not applicable</MenuItem>
                            {COVER_CATEGORIES.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                            value={form.description}
                            onChange={(e) =>
                                setForm((prev) => ({
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
                            value={form.occurredAt}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    occurredAt: e.target.value,
                                }))
                            }
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={form.wasInsuredClaim}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            wasInsuredClaim: e.target.checked,
                                        }))
                                    }
                                />
                            }
                            label="This was claimed against another insurer"
                        />
                        {/* Only relevant when the checkbox above is ticked. */}
                        {form.wasInsuredClaim && (
                            <TextField
                                label="Which insurer?"
                                fullWidth
                                value={form.otherInsurer}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        otherInsurer: e.target.value,
                                    }))
                                }
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={saving || !form.description.trim()}
                        onClick={save}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
