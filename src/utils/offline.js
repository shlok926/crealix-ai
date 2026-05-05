// ==================== Offline / Last-Content Cache ====================
// Persists last-generated content per feature key in localStorage so users
// can still see their last results when offline.

const PREFIX = 'biospark_offline_';

/**
 * Cache any data under a feature key (e.g. 'bios', 'hashtags', 'captions').
 * @param {string} key
 * @param {*} data — must be JSON-serialisable
 */
export function cacheContent(key, data) {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify({
            data,
            cachedAt: new Date().toISOString()
        }));
    } catch {/* quota exceeded – silently skip */ }
}

/**
 * Retrieve cached content.
 * @param {string} key
 * @returns {{ data: *, cachedAt: string } | null}
 */
export function getCachedContent(key) {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearCache(key) {
    localStorage.removeItem(PREFIX + key);
}

/** True when the browser reports no network connectivity */
export function isOffline() {
    return !navigator.onLine;
}
