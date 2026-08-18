import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { TESTIMONIALS } from "../constants";

// Static client quotes, from the TESTIMONIALS list.
export function Testimonials() {
    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                py: 8,
                borderTop: "1px solid",
                borderColor: "divider",
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="h4" align="center" sx={{ mb: 5 }}>
                    Trusted by our members
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                    }}
                >
                    {TESTIMONIALS.map((testimonial) => (
                        <Card
                            key={testimonial.name}
                            variant="outlined"
                            sx={{ flex: "1 1 280px", maxWidth: 340 }}
                        >
                            <CardContent>
                                <FormatQuoteIcon
                                    color="secondary"
                                    sx={{ fontSize: 32, mb: 1 }}
                                />
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {testimonial.quote}
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {testimonial.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
