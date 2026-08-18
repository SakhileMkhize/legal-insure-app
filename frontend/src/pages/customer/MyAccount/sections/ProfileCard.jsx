import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import { formatDate } from "../../../../utils/formatDate";

// Avatar, contact details, and the log out action.
export function ProfileCard({ currentUser, onLogout }) {
    return (
        <Card variant="outlined" sx={{ flex: "1 1 320px" }}>
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center", mb: 2 }}
                >
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "secondary.main",
                            color: "primary.main",
                            fontWeight: 700,
                        }}
                    >
                        {currentUser.firstName[0]}
                        {currentUser.lastName[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {currentUser.firstName} {currentUser.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {currentUser.email}
                        </Typography>
                    </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                            Phone
                        </Typography>
                        <Typography variant="body2">
                            {currentUser.phone}
                        </Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                            Address
                        </Typography>
                        <Typography variant="body2">
                            {currentUser.address || "Not set"}
                        </Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                            Client since
                        </Typography>
                        <Typography variant="body2">
                            {formatDate(currentUser.joinedAt)}
                        </Typography>
                    </Stack>
                </Stack>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    sx={{ mt: 3 }}
                    onClick={onLogout}
                >
                    Log Out
                </Button>
            </CardContent>
        </Card>
    );
}
