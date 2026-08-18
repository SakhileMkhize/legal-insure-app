import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import { VALUE_PROPS } from "../constants";

// Four short reasons to sign up, from the static VALUE_PROPS list.
export function ValueProps() {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h4" align="center" sx={{ mb: 1 }}>
                Why legal cover matters
            </Typography>
            <Typography
                variant="body1"
                align="center"
                color="text.secondary"
                sx={{ mb: 5, maxWidth: 640, mx: "auto" }}
            >
                A single consultation with an attorney can cost more than
                months of legal cover premiums.
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: "center",
                }}
            >
                {VALUE_PROPS.map((item) => (
                    <Card
                        key={item.title}
                        variant="outlined"
                        sx={{ flex: "1 1 220px", maxWidth: 260 }}
                    >
                        <CardContent sx={{ textAlign: "center" }}>
                            <Avatar
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "secondary.main",
                                    mx: "auto",
                                    mb: 1.5,
                                }}
                            >
                                {item.icon}
                            </Avatar>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, mb: 0.5 }}
                            >
                                {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.body}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
}
