import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { CustomerNav } from "./CustomerNav";
import { AdminNav } from "./AdminNav";

// Safe to assume "role" is set here — ProtectedRoute above this layout in
// the route tree already redirected anonymous visitors to /login.
export function AppLayout() {
    const role = localStorage.getItem("role");

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                bgcolor: "background.default",
            }}
        >
            {role === "admin" ? <AdminNav /> : <CustomerNav />}
            <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
}
