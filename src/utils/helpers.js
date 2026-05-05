// ==================== Shared Helpers ====================

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function escapeAttr(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;');
}

/**
 * Debounce — delays fn execution until after `wait` ms have elapsed
 * since the last call. Returns a wrapped function.
 */
export function debounce(fn, wait = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

export function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    } catch {
        return iso;
    }
}

export function formatRelative(iso) {
    try {
        const now = Date.now();
        const diff = now - new Date(iso).getTime();
        const secs = Math.floor(diff / 1000);
        if (secs < 60) return 'just now';
        const mins = Math.floor(secs / 60);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return formatDate(iso);
    } catch {
        return '';
    }
}

/** Generate a short unique ID */
export function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
