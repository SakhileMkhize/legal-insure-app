import { Outlet, NavLink } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import logoFull from "../../assets/legalinsure-logo.png";

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
                            component="img"
                            src={logoFull}
                            alt="LegalInsure"
                            sx={{ height: 30 }}
                        />
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
