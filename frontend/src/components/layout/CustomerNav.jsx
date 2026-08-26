import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BalanceIcon from "@mui/icons-material/Balance";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { API_URL } from "../../../global";
import logoMark from "../../assets/legalinsure-mark.png";
import logoFull from "../../assets/legalinsure-logo.png";

const NAV_PATHS = ["/dashboard", "/claims", "/consultations", "/partners"];

export function CustomerNav() {
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
        <AppBar
            position="sticky"
            color="default"
            sx={{
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Toolbar sx={{ maxWidth: 1536, width: "100%", mx: "auto", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        mr: 2,
                    }}
                    onClick={() => navigate("/dashboard")}
                >
                    {/* Icon-only mark on mobile, full wordmark lockup once
                        there's room for it - mirrors the old icon+text
                        pattern this replaced. */}
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
                </Box>

                <Tabs
                    value={navValue}
                    onChange={(event, newValue) => navigate(newValue)}
                    sx={{ flexGrow: 1 }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        icon={<DashboardIcon />}
                        iconPosition="start"
                        label="Dashboard"
                        value="/dashboard"
                    />
                    <Tab
                        icon={<DescriptionIcon />}
                        iconPosition="start"
                        label="Claims"
                        value="/claims"
                    />
                    <Tab
                        icon={<EventAvailableIcon />}
                        iconPosition="start"
                        label="Consultations"
                        value="/consultations"
                    />
                    <Tab
                        icon={<BalanceIcon />}
                        iconPosition="start"
                        label="Attorneys"
                        value="/partners"
                    />
                </Tabs>

                {/* Not built yet — kept visible but inert rather than
                    hidden, so the affordance is there when it ships. */}
                <IconButton aria-label="Notifications" disabled>
                    <NotificationsIcon />
                </IconButton>

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
                    <MenuItem
                        component={NavLink}
                        to="/account"
                        onClick={() => setAnchorEl(null)}
                    >
                        My Account
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        Log Out
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
