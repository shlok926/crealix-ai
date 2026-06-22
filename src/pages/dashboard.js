// ==================== Dashboard Page ====================
import { getDailyUsage, getSavedBios, getSavedUsernames, getSavedHashtags, getSavedCaptions, getSavedTemplates, getSavedScripts, getSavedStories, getTheme, setTheme } from '../utils/storage.js';
import { showToast } from '../components/toast.js';
import { startTour } from '../utils/tour.js';
import { auth } from '../services/firebase.js';

export async function renderDashboard(container) {
    const usage = getDailyUsage();
    const bios = getSavedBios().length;
    const usernames = getSavedUsernames().length;
    const hashtags = getSavedHashtags().length;
    const captions = getSavedCaptions().length;
    const templates = getSavedTemplates().length;
    const scripts = getSavedScripts().length;
    const stories = getSavedStories().length;
    const totalSaved = bios + usernames + hashtags + captions + templates + scripts + stories;

    const user = auth.currentUser;
    const name = user?.displayName ? user.displayName.split(' ')[0] : 'Creator';
    const isDark = getTheme() === 'dark';

    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    // CSS specifically for dashboard
    const dashStyle = `
    <style>
        .dash-topbar { display:flex; justify-content:flex-end; align-items:center; gap:16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
        .dash-topbar-icon { background:transparent; border:1px solid var(--border-color); color:var(--text-primary); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s; }
        .dash-topbar-icon:hover { background:var(--bg-secondary); }
        .dash-avatar { width:40px; height:40px; border-radius:50%; background: linear-gradient(135deg, var(--accent-purple), var(--primary-color)); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; cursor:pointer; }
        
        .dash-layout { display:flex; gap: 32px; align-items:flex-start; }
        .dash-main { flex:1; min-width:0; }
        .dash-rail { width: 320px; flex-shrink:0; display:flex; flex-direction:column; gap:24px; }

        @media (max-width: 1024px) {
            .dash-layout { flex-direction:column; }
            .dash-rail { width: 100%; }
        }

        .stat-cards-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; position:relative; overflow:hidden; }
        .stat-card-title { font-size: 0.85rem; color: var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; font-weight:600; margin-bottom:12px; }
        .stat-card-value { font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; font-weight:700; color: var(--text-primary); line-height:1; margin-bottom:8px; }
        .stat-card-desc { font-size: 0.85rem; color: var(--text-tertiary); margin-bottom:16px; }
        
        .ws-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
        .ws-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display:flex; align-items:flex-start; gap:16px; text-decoration:none; transition:0.2s; position:relative; }
        .ws-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .ws-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(139, 92, 246, 0.1); color: var(--primary-color); display:flex; align-items:center; justify-content:center; }
        .ws-title { font-weight:600; color: var(--text-primary); margin-bottom:4px; font-family: 'Space Grotesk', sans-serif; }
        .ws-desc { font-size:0.8rem; color: var(--text-secondary); line-height:1.4; }
        .ws-arrow { position:absolute; right:16px; top:50%; transform:translateY(-50%); opacity:0; transition:0.2s; color:var(--primary-color); }
        .ws-card:hover .ws-arrow { opacity:1; transform:translateY(-50%) translateX(4px); }

        .radial-ring { position:relative; width:160px; height:160px; border-radius:50%; background: conic-gradient(var(--primary-color) ${usagePct}%, var(--border-color) 0); display:flex; align-items:center; justify-content:center; margin: 0 auto; }
        .radial-ring-inner { width:130px; height:130px; border-radius:50%; background: var(--bg-secondary); display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .radial-val { font-family: 'JetBrains Mono', monospace; font-size:1.8rem; font-weight:700; color:var(--text-primary); }
        .radial-label { font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; }
    </style>`;

    container.innerHTML = `
    ${dashStyle}
    <div class="page" style="max-width:1400px; margin: 0 auto; padding: 0 24px;">
        
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
                <div style="margin-bottom: 32px;">
                    <h1 style="font-family: 'Space Grotesk', sans-serif; font-size:2.2rem; margin-bottom:8px; font-weight:700;">${greeting}, ${name}! 👋</h1>
                    <p style="color:var(--text-secondary); font-size:1.05rem;">Ready to create some magic today?</p>
                </div>

                <!-- STAT CARDS -->
                <div class="stat-cards-grid">
                    <div class="stat-card">
                        <div class="stat-card-title">API Requests</div>
                        <div class="stat-card-value" style="font-family:'JetBrains Mono', monospace;">${usage.count}</div>
                        <div class="stat-card-desc">Used today (Unlimited plan active)</div>
                        <span style="display:inline-block; padding:4px 8px; background:rgba(16, 185, 129, 0.1); color:#10b981; border-radius:4px; font-size:0.75rem; font-weight:600;">Unlimited ⚡</span>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-title">Library Assets</div>
                        <div class="stat-card-value" style="font-family:'JetBrains Mono', monospace;">${totalSaved}</div>
                        <div class="stat-card-desc">Saved items across all tools</div>
                        <a href="#/saved" class="btn btn-secondary" style="font-size:0.8rem; padding:6px 12px; display:inline-block;">Open Library &rarr;</a>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(37,99,235,0.05)); border-color: rgba(139,92,246,0.2);">
                        <div class="stat-card-title" style="color:var(--primary-color)">Current Plan</div>
                        <div class="stat-card-value">Free Tier</div>
                        <div class="stat-card-desc">Basic features unlocked</div>
                        <button class="btn btn-primary" style="font-size:0.8rem; padding:6px 12px; width:100%;">Upgrade to Pro ✨</button>
                    </div>
                </div>

                <!-- WORKSPACE APPS -->
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
                    <h2 style="font-family:'Space Grotesk', sans-serif; font-size:1.4rem;">Workspace Apps</h2>
                    <div style="display:flex; gap:12px; border-bottom: 1px solid var(--border-color); padding-bottom:8px;">
                        <span style="font-size:0.85rem; color:var(--text-primary); font-weight:600; cursor:pointer;">All Tools</span>
                        <span style="font-size:0.85rem; color:var(--text-tertiary); cursor:pointer;">Generate</span>
                        <span style="font-size:0.85rem; color:var(--text-tertiary); cursor:pointer;">Grow</span>
                    </div>
                </div>
                
                <div class="ws-grid">
                    ${[
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`, label: 'Bio Generator', href: '#/generator', desc: 'Craft optimized, highly-converting Instagram bios.' },
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`, label: 'Smart Hashtags', href: '#/smart-hashtags', desc: 'Find trending tags to boost your reach.' },
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, label: 'Caption Studio', href: '#/captions', desc: 'Write viral, engaging captions instantly.' },
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, label: 'AI Image Studio', href: '#/image-gen', desc: 'Generate breathtaking visuals with Flux.' },
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`, label: 'Vision Studio', href: '#/vision', desc: 'Upload images to extract context & captions.' },
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`, label: 'Hook Generator', href: '#/hooks', desc: 'Write first lines that stop the scroll.' },
                        { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`, label: 'Reel Script', href: '#/reel-script', desc: 'Structured viral short-form video scripts.' }
                    ].map(a => `
                    <a href="${a.href}" class="ws-card">
                        <div class="ws-icon">${a.icon}</div>
                        <div>
                            <div class="ws-title">${a.label}</div>
                            <div class="ws-desc">${a.desc}</div>
                        </div>
                        <div class="ws-arrow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                    </a>`).join('')}
                </div>
            </div>

            <!-- RIGHT RAIL -->
            <div class="dash-rail">
                <!-- Usage Ring -->
                <div class="card" style="padding: 32px 24px; text-align:center;">
                    <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 24px;">Daily Health</h3>
                    <div class="radial-ring">
                        <div class="radial-ring-inner">
                            <div class="radial-val">${usage.count}</div>
                            <div class="radial-label">Reqs</div>
                        </div>
                    </div>
                    <p style="color:var(--text-secondary); font-size:0.85rem; margin-top:24px;">Your usage is completely unlimited on the current tier. Keep creating!</p>
                </div>

                <!-- Recent Activity Placeholder -->
                <div class="card" style="padding: 24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                        <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem;">Recent Activity</h3>
                        <a href="#/saved" style="font-size:0.8rem; color:var(--primary-color); text-decoration:none;">View all</a>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <div style="display:flex; gap:12px; align-items:flex-start;">
                            <div style="width:8px; height:8px; border-radius:50%; background:var(--primary-color); margin-top:6px;"></div>
                            <div>
                                <div style="font-size:0.9rem; color:var(--text-primary);">Generated a new Bio</div>
                                <div style="font-size:0.75rem; color:var(--text-tertiary);">Just now</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:12px; align-items:flex-start;">
                            <div style="width:8px; height:8px; border-radius:50%; background:var(--border-color); margin-top:6px;"></div>
                            <div>
                                <div style="font-size:0.9rem; color:var(--text-primary);">Saved a Reel Script</div>
                                <div style="font-size:0.75rem; color:var(--text-tertiary);">2 hours ago</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:12px; align-items:flex-start;">
                            <div style="width:8px; height:8px; border-radius:50%; background:var(--border-color); margin-top:6px;"></div>
                            <div>
                                <div style="font-size:0.9rem; color:var(--text-primary);">Account Created</div>
                                <div style="font-size:0.75rem; color:var(--text-tertiary);">Welcome to Crealix!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.getElementById('dash-theme-btn')?.addEventListener('click', () => {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        renderDashboard(container); // Re-render to update UI
    });

    setTimeout(() => {
        if (!localStorage.getItem('crealix_has_seen_tour')) {
            localStorage.setItem('crealix_has_seen_tour', 'true');
            startTour();
        }
    }, 500);
}
