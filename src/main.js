// ==================== Crealix AI — Main Entry ====================
import './styles/index.css';
import { renderSidebar, initAuthListener } from './components/sidebar.js';
import { initTheme } from './components/themeToggle.js';
import { getTheme } from './utils/storage.js';
import { auth } from './services/firebase.js';
import { getUserProfile, saveUserPlan, cachePlan, getCachedPlan } from './services/userPlan.js';
import { onAuthStateChanged } from 'firebase/auth';
import { checkRouteAccess } from './utils/featureGate.js';

// Apply theme immediately to avoid flash
(function() {
    const t = localStorage.getItem('biospark_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
})();

// ── Initial skeleton (#9) ──────────────────────────────────────
function showAppSkeleton() {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `
    <div class="page page-narrow">
        <div class="skeleton skeleton-line" style="width:40%;height:28px;margin-bottom:12px"></div>
        <div class="skeleton skeleton-line" style="width:60%;height:16px"></div>
        <div class="card skeleton-card mt-xl" style="height:120px"></div>
        <div class="card skeleton-card mt-lg" style="height:80px"></div>
        <div class="card skeleton-card mt-lg" style="height:80px"></div>
    </div>`;
}

// ── Lazy-loaded route map ─────────────────────────────────────
const ROUTES = {
    '/': () => import('./pages/home.js').then(m => m.renderHome),
    '/generator': () => import('./pages/generator.js').then(m => m.renderGenerator),
    '/username': () => import('./pages/username.js').then(m => m.renderUsername),
    '/templates': () => import('./pages/templates.js').then(m => m.renderTemplates),
    '/saved': () => import('./pages/saved.js').then(m => m.renderSaved),
    '/smart-hashtags': () => import('./pages/hashtags.js').then(m => m.renderHashtagsPage),
    '/captions': () => import('./pages/captions.js').then(m => m.renderCaptionsPage),
    '/audit': () => import('./pages/audit.js').then(m => m.renderAuditPage),
    '/hooks': () => import('./pages/hooks.js').then(m => m.renderHooksPage),
    '/dashboard': () => import('./pages/dashboard.js').then(m => m.renderDashboard),
    // ── New role-based routes ─────────────────────────────────
    '/login': () => import('./pages/login.js').then(m => m.renderLoginPage),
    '/onboarding': () => import('./pages/onboarding.js').then(m => m.renderOnboarding),
    '/bulk-generator': () => import('./pages/bulk-generator.js').then(m => m.renderBulkGenerator),
    '/reel-script': () => import('./pages/reel-script.js').then(m => m.renderReelScript),
    '/story-ideas': () => import('./pages/story-ideas.js').then(m => m.renderStoryIdeas),
    '/image-gen': () => import('./pages/image-generator.js').then(m => m.renderImageGenerator),
    '/vision': () => import('./pages/vision.js').then(m => m.renderVisionPage)
};

function getRoute() {
    const hash = window.location.hash.replace('#', '') || '/';
    return hash;
}

async function navigate() {
    const route = getRoute();
    const pageContent = document.getElementById('page-content');

    const currentUser = auth.currentUser;
    const isGuest = sessionStorage.getItem('biospark_guest') === 'true';

    const PUBLIC_ROUTES = ['/', '/login', '/generator', '/username', '/smart-hashtags'];

    // 🔒 Auth Check: Force login if not authenticated and not a guest
    if (!currentUser && !isGuest && !PUBLIC_ROUTES.includes(route)) {
        window.location.hash = '#/login';
        return;
    }

    // Redirect away from login if already authenticated
    if (route === '/login' && currentUser) {
        window.location.hash = '#/';
        return;
    }

    // Layout Management: Toggle full-page class for home/login
    const appContainer = document.querySelector('.app-container');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('hamburger-btn');
    
    if (route === '/login' || route === '/') {
        appContainer?.classList.add('is-full-page');
    } else {
        appContainer?.classList.remove('is-full-page');
        // Restore layout styles that login/home page might have overridden
        if (sidebar) sidebar.style.display = '';
        if (toggleBtn) toggleBtn.style.display = '';
        if (pageContent) {
            pageContent.style.marginLeft = '';
            pageContent.style.width = '';
            pageContent.style.maxWidth = '';
        }
    }

    // 🔒 Feature gate: block locked routes and show upgrade modal
    if (!checkRouteAccess(route)) {
        // Go back to previous page or home so URL doesn't stay on locked route
        const prev = window.history.length > 1 ? -1 : null;
        if (prev) window.history.back();
        else window.location.hash = '#/';
        return;
    }

    // Show skeleton while page module loads
    showAppSkeleton();

    // Render sidebar first (instant)
    renderSidebar(route, auth.currentUser, getCachedPlan());

    // Lazy-load the page module and render
    try {
        const loader = ROUTES[route] || ROUTES['/'];
        const renderPage = await loader();
        renderPage(pageContent);
    } catch (err) {
        console.error('Navigation error:', err);
        pageContent.innerHTML = `
        <div class="page page-narrow" style="text-align:center;padding-top:var(--space-2xl)">
            <h1 style="font-size:3rem;margin-bottom:var(--space-md)">😕</h1>
            <h2>Page Not Found</h2>
            <p style="color:var(--text-secondary);margin-top:8px">Something went wrong loading this page.</p>
            <a href="#/" class="btn btn-primary mt-xl">Go Home</a>
        </div>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let authInitialized = false;

function init() {
    initTheme();
    // Show a loading skeleton while we check if the user is already logged in via cookies/session
    showAppSkeleton();

    // Auth state listener: resolves initial session + handles real-time login/logout
    onAuthStateChanged(auth, async (user) => {
        if (!authInitialized) {
            authInitialized = true;
            window.addEventListener('hashchange', navigate);
            setTimeout(() => navigate(), 0);
        }

        const route = getRoute();
        if (user) {
            let profile = null;
            try { profile = await getUserProfile(user.uid); } catch(e) {}

            // Trigger Cloud Sync
            import('./utils/storage.js').then(m => m.syncAllFromCloud());

            renderSidebar(route, user, 'free');

            if (route === '/login' || route === '/onboarding') {
                window.location.hash = '#/dashboard';
            }
        } else {
            const PUBLIC_ROUTES = ['/', '/login', '/generator', '/username', '/smart-hashtags'];
            
            if (!PUBLIC_ROUTES.includes(route)) {
                const isGuest = sessionStorage.getItem('biospark_guest') === 'true';
                if (!isGuest) {
                    window.location.hash = '#/login';
                } else {
                    renderSidebar(route, null, 'spark');
                }
            } else {
                if (route !== '/' && route !== '/login') {
                    renderSidebar(route, null, 'spark');
                } else {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar) sidebar.style.display = 'none';
                }
            }
        }
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
