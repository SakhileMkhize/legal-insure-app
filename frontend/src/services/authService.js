import { simulateRequest } from "./apiUtils";
import { readCollection, writeCollection, STORAGE_KEYS } from "./storage";
import { MOCK_USERS } from "../data/mockUsers";
import { MOCK_POLICIES } from "../data/mockPolicies";
import { PLANS } from "../data/mockPlans";

function getUsers() {
    return readCollection(STORAGE_KEYS.users, MOCK_USERS);
}

function getPolicies() {
    return readCollection(STORAGE_KEYS.policies, MOCK_POLICIES);
}

export function getUserById(id) {
    return simulateRequest(
        () => {
            const user = getUsers().find((u) => u.id === id);
            if (!user) throw new Error("Session expired. Please log in again.");
            return user;
        },
        { delay: 200 },
    );
}

export function login(email, password) {
    return simulateRequest(
        () => {
            const user = getUsers().find(
                (u) =>
                    u.email.toLowerCase() === email.trim().toLowerCase() &&
                    u.password === password,
            );
            if (!user) throw new Error("Invalid email or password.");
            return user;
        },
        { delay: 500 },
    );
}

export function signup(payload) {
    return simulateRequest(
        () => {
            const users = getUsers();
            const emailTaken = users.some(
                (u) =>
                    u.email.toLowerCase() ===
                    payload.email.trim().toLowerCase(),
            );
            if (emailTaken)
                throw new Error("An account with this email already exists.");

            const plan = PLANS.find((p) => p.id === payload.planId);
            const newUser = {
                id: crypto.randomUUID(),
                role: "customer",
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                password: payload.password,
                phone: payload.phone,
                planId: payload.planId,
                joinedAt: new Date().toISOString().slice(0, 10),
            };
            writeCollection(STORAGE_KEYS.users, [...users, newUser]);

            const policies = getPolicies();
            // Policies start "pending" — nothing is covered yet. A client only
            // becomes fully active once our team or the DIY questionnaire
            // captures the underwriting details (see policyService.buildPolicy).
            const newPolicy = {
                id: crypto.randomUUID(),
                userId: newUser.id,
                planId: plan.id,
                status: "pending",
                startDate: newUser.joinedAt,
                monthlyPremium: plan.monthlyPrice,
                coverLimit: plan.coverLimit,
                coverUsed: 0,
                consultationsIncluded: plan.consultationsIncluded,
                consultationsUsed: 0,
                categoriesCovered: [],
                dependants: [],
            };
            writeCollection(STORAGE_KEYS.policies, [...policies, newPolicy]);

            return newUser;
        },
        { delay: 700, failRate: 0.05 },
    );
}
