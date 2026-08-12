import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import PaidIcon from "@mui/icons-material/Paid";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { StatCard } from "../../components/common/StatCard";
import { StatusChip } from "../../components/common/StatusChip";
import { CATEGORY_MAP } from "../../utils/categoryMap";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { formatDate } from "../../utils/formatDate";
import { downloadAuthenticatedFile } from "../../utils/downloadFile";
import { API_URL } from "../../../global";

const claimSchema = yup.object({
    category: yup.string().required("Category is required"),
    title: yup.string().trim().required("Title is required"),
    description: yup
        .string()
        .trim()
        .min(10, "Please provide more detail")
        .required("Description is required"),
    amountClaimed: yup
        .number()
        .typeError("Enter a valid amount")
        .positive("Must be greater than 0")
        .required("Amount is required"),
});

export function Claims() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [files, setFiles] = useState([]);
    const [documentsByClaim, setDocumentsByClaim] = useState({});
    const [documentsLoading, setDocumentsLoading] = useState({});
    const [uploadingId, setUploadingId] = useState(null);
    const [evidenceWarning, setEvidenceWarning] = useState(null);

    const loadClaims = () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API_URL}/claims/me`, { headers }).then((response) => response.json()),
            fetch(`${API_URL}/policies/me`, { headers }).then((response) => response.json()),
        ])
            .then(([claimsData, policyData]) => {
                setClaims(claimsData);
                setPolicy(policyData);
            })
            .catch(() => setError("We couldn't load your claims right now."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadClaims();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uploadClaimDocuments = (claimId, fileList) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        fileList.forEach((file) => formData.append("files", file));

        return fetch(`${API_URL}/claims/${claimId}/documents`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        }).then((response) =>
            response
                .json()
                .then((data) =>
                    response.ok ? data : Promise.reject(new Error(data.message)),
                ),
        );
    };

    const loadClaimDocuments = (claimId) => {
        setDocumentsLoading((prev) => ({ ...prev, [claimId]: true }));
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/claims/${claimId}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((docs) =>
                setDocumentsByClaim((prev) => ({ ...prev, [claimId]: docs })),
            )
            .catch(() => { })
            .finally(() =>
                setDocumentsLoading((prev) => ({ ...prev, [claimId]: false })),
            );
    };

    const handleFileSelect = (event) => {
        setFiles((prev) => [...prev, ...Array.from(event.target.files)]);
        event.target.value = "";
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAttachEvidence = (claimId, event) => {
        const selected = Array.from(event.target.files);
        event.target.value = "";
        if (selected.length === 0) return;

        setEvidenceWarning(null);
        setUploadingId(claimId);
        uploadClaimDocuments(claimId, selected)
            .then((created) =>
                setDocumentsByClaim((prev) => ({
                    ...prev,
                    [claimId]: [...(prev[claimId] ?? []), ...created],
                })),
            )
            .catch((err) =>
                setEvidenceWarning(
                    err.message ||
                    "Evidence could not be uploaded. Try a PDF, JPG, PNG, DOC or DOCX under 10MB.",
                ),
            )
            .finally(() => setUploadingId(null));
    };

    const formik = useFormik({
        initialValues: {
            category: "",
            title: "",
            description: "",
            amountClaimed: "",
        },
        validationSchema: claimSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            setSubmitError(null);
            const token = localStorage.getItem("token");
            fetch(`${API_URL}/claims/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...values,
                    amountClaimed: Number(values.amountClaimed),
                }),
            })
                .then((response) =>
                    response
                        .json()
                        .then((data) =>
                            response.ok ? data : Promise.reject(new Error(data.message)),
                        ),
                )
                .then((claim) => {
                    resetForm();
                    setDialogOpen(false);
                    loadClaims();

                    const pendingFiles = files;
                    setFiles([]);
                    if (pendingFiles.length > 0) {
                        uploadClaimDocuments(claim.id, pendingFiles).catch(() =>
                            setEvidenceWarning(
                                `Your claim was submitted, but the attached evidence failed to upload. You can attach it again from "${claim.title}" in the list below.`,
                            ),
                        );
                    }
                })
                .catch((err) => setSubmitError(err.message))
                .finally(() => setSubmitting(false));
        },
    });

    const totalClaimed = claims.reduce(
        (sum, claim) => sum + claim.amountClaimed,
        0,
    );
    const pendingCount = claims.filter(
        (claim) => claim.status === "pending" || claim.status === "in-review",
    ).length;
    const approvedCount = claims.filter(
        (claim) => claim.status === "approved",
    ).length;

    return (
        <Box>
            <Stack
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    My Claims
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    disabled={policy?.status === "pending"}
                    onClick={() => setDialogOpen(true)}
                >
                    Submit New Claim
                </Button>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Track every claim you've submitted and its progress.
            </Typography>

            {!loading && !error && (
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        mb: 4,
                    }}
                >
                    <StatCard
                        icon={<DescriptionIcon />}
                        label="Total Claims"
                        value={claims.length}
                    />
                    <StatCard
                        icon={<PaidIcon />}
                        label="Total Claimed"
                        value={`R${totalClaimed.toLocaleString()}`}
                        accent="secondary"
                    />
                    <StatCard
                        icon={<PendingActionsIcon />}
                        label="Pending Review"
                        value={pendingCount}
                    />
                    <StatCard
                        icon={<CheckCircleIcon />}
                        label="Approved"
                        value={approvedCount}
                        accent="secondary"
                    />
                </Box>
            )}

            {evidenceWarning && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    onClose={() => setEvidenceWarning(null)}
                >
                    {evidenceWarning}
                </Alert>
            )}

            {!loading && policy?.status === "pending" && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                navigate("/dashboard/build-policy")
                            }
                        >
                            Build Policy
                        </Button>
                    }
                >
                    Your policy hasn't been built yet, so there's nothing to
                    claim against. Finish setting up your cover first.
                </Alert>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && claims.length === 0 && (
                <Alert severity="info">
                    You haven't submitted any claims yet.
                </Alert>
            )}
            {!loading && !error && claims.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 48 }} />
                                <TableCell sx={{ fontWeight: 700 }}>
                                    Claim
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                    Date
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 700 }}
                                >
                                    Amount
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {claims.map((claim, index) => {
                                const category = CATEGORY_MAP[claim.category];
                                const expanded = expandedId === claim.id;
                                const toggle = () => {
                                    const next = expanded ? null : claim.id;
                                    setExpandedId(next);
                                    if (next && !documentsByClaim[next]) {
                                        loadClaimDocuments(next);
                                    }
                                };

                                return (
                                    <Fragment key={claim.id}>
                                        <TableRow
                                            hover
                                            onClick={toggle}
                                            sx={{
                                                cursor: "pointer",
                                                backgroundColor:
                                                    index % 2 === 1
                                                        ? "action.hover"
                                                        : "transparent",
                                                "& > .MuiTableCell-root": {
                                                    py: 1.75,
                                                    borderBottom: expanded
                                                        ? "none"
                                                        : undefined,
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        transform: expanded
                                                            ? "rotate(180deg)"
                                                            : "none",
                                                        transition:
                                                            "transform 0.2s",
                                                    }}
                                                >
                                                    <ExpandMoreIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {claim.title}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {category?.label ??
                                                        claim.category}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    claim.submittedAt,
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                R
                                                {claim.amountClaimed.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    status={claim.status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                sx={{
                                                    py: 0,
                                                    borderBottom: expanded
                                                        ? undefined
                                                        : "none",
                                                }}
                                            >
                                                <Collapse
                                                    in={expanded}
                                                    timeout="auto"
                                                    unmountOnExit
                                                >
                                                    <Box
                                                        sx={{
                                                            py: 2,
                                                            pl: { xs: 0, sm: 7 },
                                                            pr: 1,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {claim.description}
                                                        </Typography>
                                                        {claim.decidedAt && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    display:
                                                                        "block",
                                                                    mt: 1,
                                                                }}
                                                            >
                                                                Decided{" "}
                                                                {formatDate(
                                                                    claim.decidedAt,
                                                                )}
                                                            </Typography>
                                                        )}

                                                        <Divider
                                                            sx={{ my: 1.5 }}
                                                        />

                                                        <Stack
                                                            direction="row"
                                                            sx={{
                                                                justifyContent:
                                                                    "space-between",
                                                                alignItems:
                                                                    "center",
                                                                mb: 1,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    letterSpacing: 0.5,
                                                                }}
                                                            >
                                                                EVIDENCE
                                                            </Typography>
                                                            <Button
                                                                size="small"
                                                                component="label"
                                                                startIcon={
                                                                    <AttachFileIcon fontSize="small" />
                                                                }
                                                                disabled={
                                                                    uploadingId ===
                                                                    claim.id
                                                                }
                                                            >
                                                                {uploadingId ===
                                                                    claim.id
                                                                    ? "Uploading…"
                                                                    : "Attach evidence"}
                                                                <input
                                                                    type="file"
                                                                    hidden
                                                                    multiple
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        handleAttachEvidence(
                                                                            claim.id,
                                                                            event,
                                                                        )
                                                                    }
                                                                />
                                                            </Button>
                                                        </Stack>

                                                        {documentsLoading[
                                                            claim.id
                                                        ] && (
                                                                <CircularProgress
                                                                    size={16}
                                                                />
                                                            )}
                                                        {!documentsLoading[
                                                            claim.id
                                                        ] &&
                                                            (documentsByClaim[
                                                                claim.id
                                                            ]?.length ?? 0) ===
                                                            0 && (
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    No documents attached yet.
                                                                </Typography>
                                                            )}
                                                        <Stack spacing={0.5}>
                                                            {(
                                                                documentsByClaim[
                                                                claim.id
                                                                ] ?? []
                                                            ).map((doc) => (
                                                                <Stack
                                                                    key={
                                                                        doc.id
                                                                    }
                                                                    direction="row"
                                                                    spacing={
                                                                        1
                                                                    }
                                                                    sx={{
                                                                        alignItems:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <InsertDriveFileIcon
                                                                        fontSize="small"
                                                                        color="action"
                                                                    />
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            flex: 1,
                                                                        }}
                                                                        noWrap
                                                                    >
                                                                        {
                                                                            doc.fileName
                                                                        }
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
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setFiles([]);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Submit a New Claim</DialogTitle>
                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <DialogContent>
                        {submitError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {submitError}
                            </Alert>
                        )}
                        <Stack spacing={2.5}>
                            <TextField
                                select
                                label="Category"
                                name="category"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.category &&
                                    Boolean(formik.errors.category)
                                }
                                helperText={
                                    formik.touched.category &&
                                    formik.errors.category
                                }
                                fullWidth
                            >
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
                                label="Title"
                                name="title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.title &&
                                    Boolean(formik.errors.title)
                                }
                                helperText={
                                    formik.touched.title && formik.errors.title
                                }
                                fullWidth
                            />
                            <TextField
                                label="Description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.description &&
                                    Boolean(formik.errors.description)
                                }
                                helperText={
                                    formik.touched.description &&
                                    formik.errors.description
                                }
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                label="Amount Claimed (R)"
                                name="amountClaimed"
                                type="number"
                                value={formik.values.amountClaimed}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                    formik.touched.amountClaimed &&
                                    Boolean(formik.errors.amountClaimed)
                                }
                                helperText={
                                    formik.touched.amountClaimed &&
                                    formik.errors.amountClaimed
                                }
                                fullWidth
                            />
                            <Box>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    startIcon={
                                        <AttachFileIcon fontSize="small" />
                                    }
                                >
                                    Attach Evidence (optional)
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                                {files.length > 0 && (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            flexWrap: "wrap",
                                            gap: 1,
                                            mt: 1,
                                        }}
                                    >
                                        {files.map((file, index) => (
                                            <Chip
                                                key={`${file.name}-${index}`}
                                                label={file.name}
                                                size="small"
                                                onDelete={() =>
                                                    removeFile(index)
                                                }
                                            />
                                        ))}
                                    </Stack>
                                )}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", mt: 0.5 }}
                                >
                                    PDF, JPG, PNG, DOC or DOCX - up to 10MB
                                    each.
                                </Typography>
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button
                            onClick={() => {
                                setDialogOpen(false);
                                setFiles([]);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            disabled={formik.isSubmitting}
                            startIcon={
                                formik.isSubmitting ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : null
                            }
                        >
                            Submit Claim
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
