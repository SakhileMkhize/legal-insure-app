// Option lists for the select fields in the Employment and Banking
// dialogs — kept as plain arrays rather than fetched, since they mirror
// the fixed CHECK constraints on the backend.
export const EMPLOYMENT_STATUSES = [
    { value: "employed", label: "Employed" },
    { value: "self-employed", label: "Self-employed" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
    { value: "student", label: "Student" },
];

export const MARITAL_STATUSES = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
];

export const PAYMENT_METHODS = [
    { value: "debit_order", label: "Debit Order" },
    { value: "eft", label: "EFT" },
    { value: "card", label: "Card" },
];
