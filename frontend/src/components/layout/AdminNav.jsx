import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import GavelIcon from "@mui/icons-material/Gavel";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PeopleIcon from "@mui/icons-material/People";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import * as authService from "../../services/authService";

const NAV_PATHS = ["/admin", "/admin/clients", "/admin/claims"];

export function AdminNav() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        authService.getUserById(localStorage.getItem("userId")).then(setCurrentUser);
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
        navigate("/login");
    };

    return (
        <AppBar position="sticky" sx={{ bgcolor: "primary.main" }}>
            <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mr: 2,
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
                            bgcolor: "secondary.main",
                            color: "primary.main",
                        }}
                    >
                        <GavelIcon fontSize="small" />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            display: { xs: "none", sm: "block" },
                        }}
                    >
                        LegalInsure
                    </Typography>
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
