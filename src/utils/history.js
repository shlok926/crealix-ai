// ==================== Bio Generation History (session-based) ====================
// Stores up to 10 generation runs per browser session (sessionStorage)

const SESSION_KEY = 'biospark_history';
const MAX_ENTRIES = 10;

/**
 * Add a history entry.
 * @param {{ bios: string[], tone: string, niche: string, description: string }} entry
 */
export function addToHistory(entry) {
    const history = getHistory();
    history.unshift({
        ...entry,
        id: Date.now().toString(36),
        at: new Date().toISOString()
    });
    // Keep only last MAX_ENTRIES
    const trimmed = history.slice(0, MAX_ENTRIES);
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
    } catch {/* storage full – silently ignore */ }
}

/** @returns {{ id: string, bios: string[], tone: string, niche: string, description: string, at: string }[]} */
export function getHistory() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    } catch {
        return [];
    }
}

export function clearHistory() {
    sessionStorage.removeItem(SESSION_KEY);
}
