import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { CategoryIcon } from "../../../../components/common/CategoryIcon";
import { COVER_CATEGORIES } from "../../../../data/coverCategories";

// Which legal matter categories the policy should cover; at least one is
// required to proceed (enforced by stepValid in the parent wizard).
export function CoverCategoriesStep({ formData, updateFormData }) {
    // Adds or removes a single category from the selected list, depending
    // on whether it's already there.
    const toggleCategory = (categoryId) => {
        const isSelected = formData.categoriesCovered.includes(categoryId);
        updateFormData({
            categoriesCovered: isSelected
                ? formData.categoriesCovered.filter((c) => c !== categoryId)
                : [...formData.categoriesCovered, categoryId],
        });
    };

    return (
        <Stack spacing={2.5}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Cover Categories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Select every type of legal matter you'd like your policy
                    to cover.
                </Typography>
            </Box>
            <FormGroup>
                {COVER_CATEGORIES.map((category) => (
                    <FormControlLabel
                        key={category.id}
                        control={
                            <Checkbox
                                checked={formData.categoriesCovered.includes(
                                    category.id,
                                )}
                                onChange={() => toggleCategory(category.id)}
                            />
                        }
                        label={
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <CategoryIcon
                                    name={category.icon}
                                    color="primary"
                                    fontSize="small"
                                />
                                <Typography variant="body2">
                                    {category.label}
                                </Typography>
                            </Stack>
                        }
                    />
                ))}
            </FormGroup>
        </Stack>
    );
}
