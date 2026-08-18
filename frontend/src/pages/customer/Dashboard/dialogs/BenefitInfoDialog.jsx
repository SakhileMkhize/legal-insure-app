import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import { BENEFIT_ACTIONS, getBenefitStatus, getBenefitUsageSummary } from "../constants";

// "More Info" dialog for whichever benefit was clicked. "benefit" doubles
// as both the open/closed flag and the data source, so there's no
// separate boolean to keep in sync.
export function BenefitInfoDialog({ benefit, onClose, navigate }) {
    return (
        <Dialog open={Boolean(benefit)} onClose={onClose} fullWidth maxWidth="sm">
            {benefit && (
                <>
                    <DialogTitle
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {benefit.label}
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {benefit.description}
                        </Typography>
                        <Alert
                            severity={
                                getBenefitStatus(benefit).color === "success"
                                    ? "success"
                                    : "info"
                            }
                            variant="outlined"
                        >
                            {getBenefitUsageSummary(benefit)}
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button onClick={onClose}>Close</Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                                const action = BENEFIT_ACTIONS[benefit.id];
                                onClose();
                                if (action) navigate(action.path);
                            }}
                        >
                            {BENEFIT_ACTIONS[benefit.id]?.label ?? "Get Started"}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
