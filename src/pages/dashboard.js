// ==================== Dashboard Page ====================
import { getDailyUsage, getSavedBios, getSavedUsernames, getSavedHashtags, getSavedCaptions, getSavedTemplates, getSavedScripts, getSavedStories } from '../utils/storage.js';
import { showToast } from '../components/toast.js';

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

    const hasAnyActivity = totalSaved > 0 || usage.count > 0;
    const usagePct = Math.min((usage.count / 5) * 100, 100);

    const emptyState = `
    <div class="empty-state" style="margin-top:var(--space-2xl)">
        <div class="empty-state-icon">📊</div>
        <h3 class="empty-state-title">No Stats Yet</h3>
        <p class="empty-state-desc">Generate some bios, captions or hashtags to see your usage stats here!</p>
        <a href="#/generator" class="btn btn-primary mt-lg">✨ Generate Your First Bio</a>
    </div>`;

    container.innerHTML = `
    <div class="page page-narrow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-xs);">
            <h1 class="section-title" style="margin-bottom:0; display:flex; align-items:center; gap: 10px; font-size: 1.8rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Creator Studio
            </h1>
            <a href="#/" class="btn btn-secondary" style="display:flex; align-items:center; gap: 8px; text-decoration:none; padding: 6px 12px; font-size: 0.85rem; background: transparent; border: 1px solid var(--border-color);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Return to Main Site
            </a>
        </div>
        <p class="section-subtitle" style="margin-bottom: var(--space-xl);">Welcome back. Here is an overview of your workspace and assets.</p>
        
        <div class="dashboard-grid">
            <div class="card dashboard-card">
                <div class="dashboard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div class="dashboard-val">${usage.count}/∞</div>
                <div class="dashboard-label">Daily API Requests</div>
                <div class="usage-bar-container">
                    <div class="usage-bar" style="width:100%"></div>
                </div>
            </div>
            <div class="card dashboard-card">
                <div class="dashboard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div class="dashboard-val">${totalSaved}</div>
                <div class="dashboard-label">Assets in Library</div>
            </div>
            <div class="card dashboard-card">
                <div class="dashboard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div class="dashboard-val">Free Tier</div>
                <div class="dashboard-label">Current Plan</div>
            </div>
        </div>

        <h3 class="feature-title mt-xl" style="margin-bottom:var(--space-lg); display:flex; align-items:center; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Workspace Apps
        </h3>
        <div class="creator-quick-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
            ${[
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, label: 'AI Image Studio', href: '#/image-gen', desc: 'Flux.1 Art Studio' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`, label: 'AI Vision Studio', href: '#/vision', desc: 'Image to Caption' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`, label: 'Bio Generator', href: '#/generator', desc: 'Create stunning bios' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`, label: 'Smart Hashtags', href: '#/smart-hashtags', desc: 'Trending tags' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, label: 'Caption Studio', href: '#/captions', desc: 'Write viral captions' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`, label: 'Hook Generator', href: '#/hooks', desc: 'Stop the scroll' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, label: 'Profile Audit', href: '#/audit', desc: 'Deep Strategy Scan' },
                { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`, label: 'Reel Script', href: '#/reel-script', desc: 'Viral scripts' }
            ].map(a => `
            <a href="${a.href}" class="creator-quick-card card" style="text-decoration:none; display:flex; align-items:center; gap:var(--space-md); padding:var(--space-md); transition: transform 0.2s;">
                <div style="color:var(--text-accent); display:flex; align-items:center; justify-content:center">${a.icon}</div>
                <div>
                    <div style="font-weight:600; color:var(--text-primary)">${a.label}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary)">${a.desc}</div>
                </div>
            </a>`).join('')}
        </div>

        <div class="card mt-xl" style="padding: var(--space-xl);">
            <h3 class="feature-title" style="margin-bottom:var(--space-lg); display:flex; align-items:center; gap:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Asset Library Storage
            </h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-md)">
                ${[
                    { label: 'Bios Generated', count: bios, href: '#/saved' },
                    { label: 'Username Ideas', count: usernames, href: '#/saved' },
                    { label: 'Hashtag Collections', count: hashtags, href: '#/saved' },
                    { label: 'Post Captions', count: captions, href: '#/saved' },
                    { label: 'Custom Templates', count: templates, href: '#/templates' },
                    { label: 'Reel Scripts', count: scripts, href: '#/saved' },
                    { label: 'Story Concepts', count: stories, href: '#/saved' }
                ].map(item => `
                <div style="display:flex;align-items:center;justify-content:space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                    <span style="color:var(--text-secondary);font-size:0.9rem; font-weight:500;">${item.label}</span>
                    <div style="display:flex;align-items:center;gap:var(--space-md)">
                        <span style="font-weight:600;color:var(--text-primary); font-family: monospace;">${item.count.toString().padStart(2, '0')}</span>
                        <div class="stat-bar-container" style="width:120px; height: 6px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                            <div style="height:100%; width:${Math.min(item.count * 10, 100)}%; background: var(--primary-color); border-radius: 4px; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </div>`;
}
