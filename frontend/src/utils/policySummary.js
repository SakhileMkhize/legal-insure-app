import { CATEGORY_MAP } from "./categoryMap";
import { formatDate } from "./formatDate";

// Builds a plain-text policy schedule from data already loaded on the
// dashboard (no backend document store exists yet, so this is generated
// client-side from the policy/user/plan the page already has in memory).
export function buildPolicySummary({ user, policy, plan }) {
    const categories = (policy.categoriesCovered ?? [])
        .map((id) => CATEGORY_MAP[id]?.label ?? id)
        .join(", ");

    const lines = [
        "LEGALINSURE - POLICY SUMMARY",
        "=============================",
        "",
        `Generated: ${formatDate(new Date())}`,
        `Policy ID: ${policy.id}`,
        `Status: ${policy.status}`,
        "",
        "POLICYHOLDER",
        "-------------",
        `Name: ${user.firstName} ${user.lastName}`,
        `Email: ${user.email}`,
        user.phone ? `Phone: ${user.phone}` : null,
        user.idNumber ? `ID Number: ${user.idNumber}` : null,
        user.address ? `Address: ${user.address}` : null,
        "",
        "COVER",
        "-----",
        `Plan: ${plan?.name ?? policy.planId}`,
        `Monthly Premium: R${policy.monthlyPremium}`,
        `Active Since: ${formatDate(policy.startDate)}`,
        policy.coverLimit > 0
            ? `Legal Expense Cover Limit: R${policy.coverLimit.toLocaleString()}`
            : null,
        policy.coverLimit > 0
            ? `Cover Used: R${policy.coverUsed.toLocaleString()}`
            : null,
        `Consultations Included: ${
            policy.consultationsIncluded === -1
                ? "Unlimited"
                : policy.consultationsIncluded
        }`,
        `Consultations Used: ${policy.consultationsUsed}`,
        categories ? `Categories Covered: ${categories}` : null,
        "",
        "COMPLIANCE",
        "----------",
        `POPIA Consent: ${policy.popiaConsent ? "Confirmed" : "Not confirmed"}`,
        `Personal Use Confirmed: ${policy.personalUseConfirmed ? "Yes" : "No"}`,
        `Pre-Existing Dispute Declared: ${policy.hasPreExistingDispute ? "Yes" : "No"}`,
        "",
        "This summary is generated for your records and does not replace",
        "the full policy terms and conditions.",
    ].filter((line) => line !== null);

    return lines.join("\n");
}

export function downloadPolicySummary(args) {
    const text = buildPolicySummary(args);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `policy-summary-${args.policy.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
