import { getTheme, setTheme } from '../utils/storage.js';
import { auth } from '../services/firebase.js';

export function renderPageShell(container, { title, subtitle, iconSvg, renderMain, renderRail }) {
    const user = auth.currentUser;
    const name = user?.displayName ? user.displayName.split(' ')[0] : 'Creator';

    const shellHtml = `
    <div class="page" style="width:100%; padding: 0 24px;">
        <!-- TOPBAR -->
        <div class="dash-topbar" id="dashboard-topbar">
            <div style="flex:1;"></div>
            <button class="dash-topbar-icon" id="dash-theme-btn" title="Toggle Theme">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <button class="dash-topbar-icon" title="Notifications">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <div class="dash-avatar" onclick="window.location.hash='#/settings'" title="Settings">${name.charAt(0)}</div>
        </div>

        <div class="dash-layout">
            <!-- LEFT MAIN CONTENT -->
            <div class="dash-main">
                <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 16px;">
                    <div class="gradient-icon-chip">
                        ${iconSvg}
                    </div>
                    <div>
                        <h1 style="font-family: 'Space Grotesk', sans-serif; font-size:2.2rem; margin-bottom:4px; font-weight:700;">${title}</h1>
                        <p style="color:var(--text-secondary); font-size:1.05rem; margin:0;">${subtitle}</p>
                    </div>
                </div>
                
                <div id="shell-offline-banner"></div>

                <div class="card" style="border: 1px solid var(--border-color);" id="shell-main-content"></div>
                
                <div id="shell-results-container"></div>
            </div>

            <!-- RIGHT RAIL -->
            <div class="dash-rail" id="shell-rail-content"></div>
        </div>
    </div>`;

    container.innerHTML = shellHtml;

    document.getElementById('dash-theme-btn')?.addEventListener('click', () => {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        window.dispatchEvent(new Event('themeToggled'));
    });

    const mainContainer = document.getElementById('shell-main-content');
    const railContainer = document.getElementById('shell-rail-content');

    if (renderMain) renderMain(mainContainer);
    if (renderRail) renderRail(railContainer);
}
