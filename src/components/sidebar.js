// ==================== Sidebar Component ====================
import { getTheme, setTheme } from '../utils/storage.js';
import { openSettingsModal } from './modal.js';
import { auth } from '../services/firebase.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { showToast } from './toast.js';
import { getCachedPlan } from '../services/userPlan.js';

const provider = new GoogleAuthProvider();

let isResizing = false;
if (!window.__sidebarResizeAttached) {
    window.__sidebarResizeAttached = true;
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        let newWidth = e.clientX;
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 600) newWidth = 600;
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    });
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            const width = document.documentElement.style.getPropertyValue('--sidebar-width');
            if (width) localStorage.setItem('crealix_sidebar_width', width);
        }
    });

    // Initialize width from localStorage
    const savedWidth = localStorage.getItem('crealix_sidebar_width');
    if (savedWidth) {
        document.documentElement.style.setProperty('--sidebar-width', savedWidth);
    }
}

// ── Auth actions ─────────────────────────────────────────────
export async function loginWithGoogle() {
    try {
        await signInWithPopup(auth, provider);
        showToast('Welcome! Signed in with Google ✅', 'success');
    } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
            showToast('Sign in failed: ' + (err.message || 'Unknown error'), 'error');
        }
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.hash = '#/';
        showToast('Signed out successfully', 'info');
    } catch (err) {
        showToast('Logout failed', 'error');
    }
}

// Re-render sidebar whenever auth state changes
export function initAuthListener(getRoute) {
    onAuthStateChanged(auth, (user) => {
        const route = getRoute ? getRoute() : (window.location.hash.replace('#', '') || '/');
        renderSidebar(route, user, 'free');
    });
}

// Navigation links
const NAV_LINKS = [
    {
        p: '/dashboard', l: 'Dashboard',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="18" height="7"/></svg>`
    },
    {
        p: '/generator', l: 'Bio Generator',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`
    },
    {
        p: '/smart-hashtags', l: 'Smart Hashtags',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`
    },
    {
        p: '/captions', l: 'Caption Studio',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    },
    {
        p: '/image-gen', l: 'AI Image Studio',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
    },
    {
        p: '/vision', l: 'AI Vision Studio',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`
    },
    {
        p: '/username', l: 'Username Finder',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
    },
    {
        p: '/audit', l: 'Profile Audit',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
    },
    {
        p: '/hooks', l: 'Hook Generator',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`
    },
    {
        p: '/templates', l: 'Templates',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
    },
    {
        p: '/reel-script', l: 'Reel Script',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`
    },
    {
        p: '/story-ideas', l: 'Story Ideas',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/></svg>`
    },
    {
        p: '/bulk-generator', l: 'Bulk Generator',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
    },
    {
        p: '/saved', l: 'Saved',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`
    },
    {
        p: '/settings', l: 'Settings',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    }
];

// No routes are locked anymore


export function renderSidebar(route, currentUser = null, currentPlan = 'free') {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const isDark = getTheme() === 'dark';
    const themeLabel = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';

    const userSection = currentUser ? `
        <div class="sidebar-user">
            <div class="sidebar-avatar">${currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}</div>
            <div class="sidebar-user-info">
                <span class="sidebar-user-name">${currentUser.displayName || currentUser.email || 'User'}</span>
                <span class="sidebar-user-plan">${currentPlan.toUpperCase()}</span>
            </div>
        </div>
        <div class="sidebar-footer-actions">
            <button class="sidebar-icon-btn" id="sidebar-theme-btn" title="Toggle Theme">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                ${isDark ? 'Light' : 'Dark'}
            </button>
            <button class="sidebar-icon-btn" id="sidebar-logout-btn" title="Sign out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
        </div>` : `
        <div class="sidebar-footer-actions" style="padding:4px 0">
            <button class="sidebar-google-btn" id="sidebar-signin-btn">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
            </button>
        </div>
        <div class="sidebar-footer-actions">
            <button class="sidebar-icon-btn" id="sidebar-theme-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                ${isDark ? 'Light' : 'Dark'}
            </button>
        </div>`;

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <a class="sidebar-logo" href="#/dashboard">
                <div class="sidebar-logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <span class="sidebar-logo-text">Crealix AI</span>
            </a>
        </div>
        <nav class="sidebar-nav">
            <span class="sidebar-section-label">Tools</span>
            ${NAV_LINKS.map(lk => {
                return `
            <a href="#${lk.p}" class="sidebar-link${route === lk.p ? ' active' : ''}" data-route="${lk.p}">
                ${lk.svg}<span>${lk.l}</span>
            </a>`;
            }).join('')}
        </nav>
        <div class="sidebar-footer">${userSection}</div>
        <div class="sidebar-resizer" id="sidebar-resizer"></div>
    `;

    // Mobile toggle
    const overlay = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
        hamburger.onclick = () => { sidebar.classList.toggle('open'); overlay?.classList.toggle('active'); };
    }
    if (overlay) {
        overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };
    }
    sidebar.querySelectorAll('[data-route]').forEach(a => {
        a.addEventListener('click', (e) => {
            sidebar.classList.remove('open'); overlay?.classList.remove('active');
        });
    });
    const resizer = document.getElementById('sidebar-resizer');
    if (resizer) {
        resizer.addEventListener('mousedown', () => {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        });
    }
    // Theme toggle
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', () => {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        renderSidebar(route, currentUser, currentPlan);
    });

    // Sign In — Google popup
    document.getElementById('sidebar-signin-btn')?.addEventListener('click', loginWithGoogle);

    // Sign Out
    document.getElementById('sidebar-logout-btn')?.addEventListener('click', logoutUser);
}
