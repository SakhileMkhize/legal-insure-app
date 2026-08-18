// Labels for the Stepper header — array index doubles as the step number
// used throughout the wizard (formData step 0 = "About You", etc.).
export const STEP_LABELS = [
    "About You",
    "Dependants",
    "Cover Categories",
    "Disclosures",
    "Review",
];

export const RELATIONSHIPS = ["Spouse", "Child", "Other"];

// Mirrors the fixed option sets on MyAccount.jsx / the backend CHECK
// constraints, so the wizard can collect the same profile fields the
// account page lets people edit after the fact.
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

// Blank shapes for each "add an item" mini-form, reused to reset them
// after every successful add.
export const EMPTY_DEPENDANT = { name: "", dateOfBirth: "", relationship: "" };
export const EMPTY_KIN = { name: "", relationship: "", phone: "", email: "" };
export const EMPTY_HISTORY_ENTRY = {
    category: "",
    description: "",
    occurredAt: "",
    wasInsuredClaim: false,
    otherInsurer: "",
};
