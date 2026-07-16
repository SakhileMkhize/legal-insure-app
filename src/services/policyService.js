import { simulateRequest } from "./apiUtils";
import { readCollection, STORAGE_KEYS } from "./storage";
import { MOCK_POLICIES } from "../data/mockPolicies";
import { PLANS } from "../data/mockPlans";

export function getPolicyForUser(userId) {
  return simulateRequest(() => {
    const policies = readCollection(STORAGE_KEYS.policies, MOCK_POLICIES);
    const policy = policies.find((p) => p.userId === userId);
    if (!policy) throw new Error("We couldn't find a policy for this account.");
    return policy;
  }, { failRate: 0.05 });
}

export function listPlans() {
  return simulateRequest(() => PLANS, { delay: 400 });
}
