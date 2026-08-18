import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";
import { CategoryIcon } from "../../../../components/common/CategoryIcon";

// Reuses the same COVER_CATEGORIES list used for claim/consultation
// category pickers elsewhere in the app.
export function CoverCategoriesSection() {
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
                    Cover across every dispute category
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                    }}
                >
                    {COVER_CATEGORIES.map((category) => (
                        <Card
                            key={category.id}
                            variant="outlined"
                            sx={{ flex: "1 1 260px", maxWidth: 300 }}
                        >
                            <CardContent sx={{ display: "flex", gap: 2 }}>
                                <CategoryIcon
                                    name={category.icon}
                                    color="primary"
                                />
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {category.label}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {category.description}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
