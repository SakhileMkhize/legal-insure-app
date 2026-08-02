const DEFAULT_DELAY = 600;

// `work` runs inside the same try/catch as the simulated network failure, so a
// thrown business error (bad login, not-found record) surfaces through the
// same .catch() pages already use for network errors , one unified error UX.
export function simulateRequest(
    work,
    { delay = DEFAULT_DELAY, failRate = 0 } = {},
) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                if (Math.random() < failRate) {
                    throw new Error(
                        "We couldn't reach the server. Please try again.",
                    );
                }
                resolve(typeof work === "function" ? work() : work);
            } catch (err) {
                reject(err);
            }
        }, delay);
    });
}
