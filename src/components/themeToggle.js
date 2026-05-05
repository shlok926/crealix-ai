// ==================== Theme Toggle Component ====================
import { getTheme, setTheme } from '../utils/storage.js';

export function createThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle theme');
    updateIcon(btn);

    btn.addEventListener('click', () => {
        const current = getTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        updateIcon(btn);
    });

    return btn;
}

function updateIcon(btn) {
    const theme = getTheme();
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

export function initTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}
