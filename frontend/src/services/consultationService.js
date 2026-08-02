import { simulateRequest } from "./apiUtils";
import { readCollection, writeCollection, STORAGE_KEYS } from "./storage";
import { MOCK_CONSULTATIONS } from "../data/mockConsultations";

function getConsultations() {
    return readCollection(STORAGE_KEYS.consultations, MOCK_CONSULTATIONS);
}

export function listConsultationsForUser(userId) {
    return simulateRequest(() => {
        const all = getConsultations().filter((c) => c.userId === userId);
        return [...all].sort(
            (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt),
        );
    });
}

export function bookConsultation(consultation) {
    return simulateRequest(
        () => {
            const consultations = getConsultations();
            const newConsultation = {
                id: crypto.randomUUID(),
                status: "scheduled",
                ...consultation,
            };
            writeCollection(STORAGE_KEYS.consultations, [
                ...consultations,
                newConsultation,
            ]);
            return newConsultation;
        },
        { delay: 700, failRate: 0.05 },
    );
}
