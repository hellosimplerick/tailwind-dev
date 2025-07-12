// ~/bessie/bessie-frontend/src/services/logTiming.js

/**
 * Send timing log to backend. Non-blocking; silently fails if offline.
 * @param {Object} params
 * @param {string} params.timestamp - ISO8601 timestamp
 * @param {string} params.action - The action performed (e.g., "initial_load", "arrow_left")
 * @param {string|number} params.roundtrip - Roundtrip time (seconds)
 */
export default async function logTiming({ timestamp, action, roundtrip }) {
    try {
        await fetch("http://localhost:8000/api/log-timing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timestamp, action, roundtrip }),
        });
    } catch (err) {
        // Non-blocking: silently fail if log endpoint is offline
    }
}
