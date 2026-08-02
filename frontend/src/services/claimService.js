import { simulateRequest } from "./apiUtils";
import { readCollection, writeCollection, STORAGE_KEYS } from "./storage";
import { MOCK_CLAIMS } from "../data/mockClaims";
import { MOCK_USERS } from "../data/mockUsers";

function getClaims() {
    return readCollection(STORAGE_KEYS.claims, MOCK_CLAIMS);
}

function sortByDateDesc(claims) {
    return [...claims].sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
    );
}

export function listClaims(userId) {
    return simulateRequest(() =>
        sortByDateDesc(getClaims().filter((c) => c.userId === userId)),
    );
}

export function listAllClaims() {
    return simulateRequest(() => {
        const users = readCollection(STORAGE_KEYS.users, MOCK_USERS);
        const claims = sortByDateDesc(getClaims());
        return claims.map((claim) => {
            const client = users.find((u) => u.id === claim.userId);
            return {
                ...claim,
                clientName: client
                    ? `${client.firstName} ${client.lastName}`
                    : "Unknown client",
            };
        });
    });
}

export function submitClaim(claim) {
    return simulateRequest(
        () => {
            const claims = getClaims();
            const newClaim = {
                id: crypto.randomUUID(),
                status: "pending",
                submittedAt: new Date().toISOString().slice(0, 10),
                decidedAt: null,
                ...claim,
            };
            writeCollection(STORAGE_KEYS.claims, [...claims, newClaim]);
            return newClaim;
        },
        { delay: 800, failRate: 0.1 },
    );
}

export function updateClaimStatus(claimId, status) {
    return simulateRequest(
        () => {
            const claims = getClaims();
            const updated = claims.map((c) =>
                c.id === claimId
                    ? {
                          ...c,
                          status,
                          decidedAt: new Date().toISOString().slice(0, 10),
                      }
                    : c,
            );
            writeCollection(STORAGE_KEYS.claims, updated);
            return updated.find((c) => c.id === claimId);
        },
        { delay: 400 },
    );
}
