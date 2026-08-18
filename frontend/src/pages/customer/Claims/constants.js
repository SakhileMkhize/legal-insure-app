import * as yup from "yup";

// Validation rules for the "Submit New Claim" form, checked by formik.
export const claimSchema = yup.object({
    category: yup.string().required("Category is required"),
    title: yup.string().trim().required("Title is required"),
    description: yup
        .string()
        .trim()
        .min(10, "Please provide more detail")
        .required("Description is required"),
    amountClaimed: yup
        .number()
        .typeError("Enter a valid amount")
        .positive("Must be greater than 0")
        .required("Amount is required"),
});
