import { simulateRequest } from "./apiUtils";
import { readCollection, STORAGE_KEYS } from "./storage";
import { MOCK_USERS } from "../data/mockUsers";
import { MOCK_POLICIES } from "../data/mockPolicies";
import { MOCK_CLAIMS } from "../data/mockClaims";
import { PLANS } from "../data/mockPlans";

export function getBusinessMetrics() {
  return simulateRequest(() => {
    const users = readCollection(STORAGE_KEYS.users, MOCK_USERS);
    const policies = readCollection(STORAGE_KEYS.policies, MOCK_POLICIES);
    const claims = readCollection(STORAGE_KEYS.claims, MOCK_CLAIMS);

    const clients = users.filter((u) => u.role === "customer");
    const activePolicies = policies.filter((p) => p.status === "active");
    const pendingClaims = claims.filter((c) => c.status === "pending" || c.status === "in-review");
    const mrr = activePolicies.reduce((sum, p) => sum + p.monthlyPremium, 0);

    return {
      totalClients: clients.length,
      activePolicies: activePolicies.length,
      pendingClaims: pendingClaims.length,
      mrr,
    };
  });
}

export function listClients() {
  return simulateRequest(() => {
    const users = readCollection(STORAGE_KEYS.users, MOCK_USERS);
    const policies = readCollection(STORAGE_KEYS.policies, MOCK_POLICIES);

    return users
      .filter((u) => u.role === "customer")
      .map((user) => {
        const policy = policies.find((p) => p.userId === user.id);
        const plan = PLANS.find((p) => p.id === policy?.planId);
        return {
          ...user,
          planName: plan?.name ?? "No plan",
          policyStatus: policy?.status ?? "inactive",
          monthlyPremium: policy?.monthlyPremium ?? 0,
        };
      });
  });
}
