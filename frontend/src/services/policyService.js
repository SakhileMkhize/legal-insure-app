import { simulateRequest } from "./apiUtils";
import { readCollection, writeCollection, STORAGE_KEYS } from "./storage";
import { MOCK_POLICIES } from "../data/mockPolicies";
import { MOCK_USERS } from "../data/mockUsers";
import { PLANS } from "../data/mockPlans";

export function getPolicyForUser(userId) {
    return simulateRequest(
        () => {
            const policies = readCollection(
                STORAGE_KEYS.policies,
                MOCK_POLICIES,
            );
            const policy = policies.find((p) => p.userId === userId);
            if (!policy)
                throw new Error("We couldn't find a policy for this account.");
            return policy;
        },
        { failRate: 0.05 },
    );
}

export function listPlans() {
    return simulateRequest(() => PLANS, { delay: 400 });
}

// Turns a "pending" policy into an active one — used by both the DIY
// questionnaire and (conceptually) our team when they build it manually.
// Captures the underwriting details a real policy needs before it can cover
// anything: identity, dependants, which categories apply, and the
// pre-existing-dispute disclosure that keeps the exclusion rule meaningful.
export function buildPolicy(userId, answers) {
    return simulateRequest(
        () => {
            const policies = readCollection(
                STORAGE_KEYS.policies,
                MOCK_POLICIES,
            );
            const updatedPolicies = policies.map((p) =>
                p.userId === userId
                    ? {
                          ...p,
                          status: "active",
                          categoriesCovered: answers.categoriesCovered,
                          dependants: answers.dependants,
                      }
                    : p,
            );
            writeCollection(STORAGE_KEYS.policies, updatedPolicies);

            const users = readCollection(STORAGE_KEYS.users, MOCK_USERS);
            const updatedUsers = users.map((u) =>
                u.id === userId
                    ? {
                          ...u,
                          dateOfBirth: answers.dateOfBirth,
                          idNumber: answers.idNumber,
                          address: answers.address,
                          hasPreExistingDispute: answers.hasPreExistingDispute,
                          preExistingDisputeDetails:
                              answers.preExistingDisputeDetails,
                      }
                    : u,
            );
            writeCollection(STORAGE_KEYS.users, updatedUsers);

            return updatedPolicies.find((p) => p.userId === userId);
        },
        { delay: 900, failRate: 0.05 },
    );
}
