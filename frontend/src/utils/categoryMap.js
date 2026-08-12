import { COVER_CATEGORIES } from "../data/coverCategories";

export const CATEGORY_MAP = Object.fromEntries(
    COVER_CATEGORIES.map((category) => [category.id, category]),
);
