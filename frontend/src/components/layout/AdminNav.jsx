import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PeopleIcon from "@mui/icons-material/People";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { API_URL } from "../../../global";
import logoMark from "../../assets/legalinsure-mark.png";
import logoFull from "../../assets/legalinsure-logo.png";

const NAV_PATHS = ["/admin", "/admin/clients", "/admin/claims"];

export function AdminNav() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then(setCurrentUser);
    }, []);

    const navValue = NAV_PATHS.includes(location.pathname)
        ? location.pathname
        : false;
    const initials = currentUser
        ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
        : "";

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AppBar position="sticky" sx={{ bgcolor: "primary.main" }}>
            <Toolbar sx={{ maxWidth: 1536, width: "100%", mx: "auto", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mr: 2,
                    }}
                >
                    {/* Icon-only mark on mobile, full wordmark lockup once
                        there's room for it. Transparent PNGs, so the blue
                        mark reads fine on this dark AppBar too. */}
                    <Box
                        component="img"
                        src={logoMark}
                        alt="LegalInsure"
                        sx={{ height: 32, display: { xs: "block", sm: "none" } }}
                    />
                    <Box
                        component="img"
                        src={logoFull}
                        alt="LegalInsure"
                        sx={{ height: 28, display: { xs: "none", sm: "block" } }}
                    />
                    <Chip
                        label="Admin"
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 700 }}
                    />
                </Box>

                <Tabs
                    value={navValue}
                    onChange={(event, newValue) => navigate(newValue)}
                    textColor="inherit"
                    sx={{
                        flexGrow: 1,
                        "& .MuiTabs-indicator": { bgcolor: "secondary.main" },
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        icon={<SpaceDashboardIcon />}
                        iconPosition="start"
                        label="Overview"
                        value="/admin"
                    />
                    <Tab
                        icon={<PeopleIcon />}
                        iconPosition="start"
                        label="Clients"
                        value="/admin/clients"
                    />
                    <Tab
                        icon={<GavelOutlinedIcon />}
                        iconPosition="start"
                        label="Claims"
                        value="/admin/claims"
                    />
                </Tabs>

                <IconButton
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    aria-label="Account menu"
                >
                    <Avatar
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: "secondary.main",
                            color: "primary.main",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                        }}
                    >
                        {initials}
                    </Avatar>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        Log Out
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
