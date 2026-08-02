import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import SearchOffIcon from "@mui/icons-material/SearchOff";

export function NotFound() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
            <SearchOffIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h4" sx={{ mb: 1 }}>
                Page not found
            </Typography>
            <Alert
                severity="warning"
                variant="outlined"
                sx={{ display: "inline-flex", mb: 3 }}
            >
                We couldn't find the page you were looking for.
            </Alert>
            <Box>
                <Button variant="contained" onClick={() => navigate("/")}>
                    Back to Home
                </Button>
            </Box>
        </Container>
    );
}
