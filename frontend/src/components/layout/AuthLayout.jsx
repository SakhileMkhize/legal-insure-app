import { Outlet, NavLink } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import GavelIcon from "@mui/icons-material/Gavel";

export function AuthLayout() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
            }}
        >
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar>
                    <Box
                        component={NavLink}
                        to="/"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            textDecoration: "none",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: "primary.main",
                                color: "secondary.main",
                            }}
                        >
                            <GavelIcon fontSize="small" />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "primary.main" }}
                        >
                            LegalInsure
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container
                maxWidth="sm"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    py: 6,
                }}
            >
                <Box sx={{ width: "100%" }}>
                    <Outlet />
                </Box>
            </Container>
        </Box>
    );
}
