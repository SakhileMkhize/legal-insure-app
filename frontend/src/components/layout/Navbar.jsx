import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import logoFull from "../../assets/legalinsure-logo.png";

const NAV_LINKS = [
    { label: "Home", to: "/" },
    { label: "Plans", to: "/plans" },
    { label: "How It Works", to: "/how-it-works" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
];

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <AppBar
            position="sticky"
            color="default"
            sx={{
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", gap: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        mr: "auto",
                    }}
                    onClick={() => navigate("/")}
                >
                    <Box
                        component="img"
                        src={logoFull}
                        alt="LegalInsure"
                        sx={{ height: 30 }}
                    />
                </Box>

                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    {NAV_LINKS.map((link) => (
                        <Button
                            key={link.to}
                            component={NavLink}
                            to={link.to}
                            end={link.to === "/"}
                            sx={{
                                color:
                                    location.pathname === link.to
                                        ? "primary.main"
                                        : "text.secondary",
                                fontWeight:
                                    location.pathname === link.to ? 700 : 500,
                            }}
                        >
                            {link.label}
                        </Button>
                    ))}
                    <Button
                        variant="text"
                        sx={{ ml: 1 }}
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate("/signup")}
                    >
                        Get Covered
                    </Button>
                </Box>

                <IconButton
                    sx={{ display: { xs: "inline-flex", md: "none" } }}
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 260 }} role="presentation">
                    <List>
                        {NAV_LINKS.map((link) => (
                            <ListItemButton
                                key={link.to}
                                component={NavLink}
                                to={link.to}
                                end={link.to === "/"}
                                onClick={() => setDrawerOpen(false)}
                            >
                                <ListItemText primary={link.label} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Divider />
                    <List>
                        <ListItemButton
                            onClick={() => {
                                setDrawerOpen(false);
                                navigate("/login");
                            }}
                        >
                            <ListItemText primary="Login" />
                        </ListItemButton>
                        <ListItemButton
                            onClick={() => {
                                setDrawerOpen(false);
                                navigate("/signup");
                            }}
                        >
                            <ListItemText primary="Get Covered" />
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
}
