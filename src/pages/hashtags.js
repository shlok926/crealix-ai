// ==================== Smart Hashtags Page ====================
import { generateSmartHashtags } from '../services/ai.js';
import { getApiKey, saveHashtag, saveCaption, incrementUsage, checkUsageLimit, getBrandVoice, getTheme, setTheme } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml, escapeAttr } from '../utils/helpers.js';
import { cacheContent, getCachedContent, isOffline } from '../utils/offline.js';
import { auth } from '../services/firebase.js';

const CONTENT_TYPES = [
    { id: 'post', label: 'Standard Post', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
    { id: 'reel', label: 'Instagram Reel', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>' },
    { id: 'carousel', label: 'Carousel', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M21 12H3"/><path d="M12 21V3"/></svg>' }
];
const NICHES = [
    { id: 'general', label: 'General', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>' },
    { id: 'fitness', label: 'Fitness', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>' },
    { id: 'travel', label: 'Travel', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' },
    { id: 'food', label: 'Food', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>' },
    { id: 'tech', label: 'Tech', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
    { id: 'fashion', label: 'Fashion', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a8 8 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>' },
    { id: 'art', label: 'Art', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="5.5" r="2.5"/><circle cx="19.5" cy="11.5" r="2.5"/><circle cx="15.5" cy="17.5" r="2.5"/><circle cx="9.5" cy="19.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c4 0 7.3-2.3 8.9-5.7.5-1 .1-2.2-.8-2.6-.9-.4-2-.1-2.5.8-.8 1.4-2.3 2.5-4.1 2.5-3.6 0-6.5-2.9-6.5-6.5 0-2.4 1.3-4.5 3.3-5.6.8-.4 1.2-1.4.8-2.3-.3-.8-1.2-1.3-2.1-.9z"/></svg>' },
    { id: 'music', label: 'Music', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' },
    { id: 'business', label: 'Business', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
    { id: 'photography', label: 'Photography', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' }
];

let state = { content: '', type: 'post', niche: 'general', results: null, caption: '' };

export function renderHashtagsPage(container) {
    const voice = getBrandVoice();
    const user = auth.currentUser;
    const name = user?.displayName ? user.displayName.split(' ')[0] : 'Creator';
    
    if (!state.content && voice.niche) {
        state.niche = NICHES.find(n => n.label === voice.niche)?.id || 'general';
    }

    const typeChips = CONTENT_TYPES.map(t =>
        `<button class="gen-chip ${state.type === t.id ? 'selected' : ''}" data-type="${t.id}">
            ${t.icon} ${t.label}
        </button>`
    ).join('');
    
    const nicheChips = NICHES.map(n =>
        `<button class="gen-chip ${state.niche === n.id ? 'selected' : ''}" data-niche="${n.id}">
            ${n.icon} ${n.label}
        </button>`
    ).join('');

    const cached = getCachedContent('hashtags');
    const offlineBanner = (isOffline() && cached) ? `
        <div class="offline-banner" style="margin-bottom:24px;">
            📵 Offline — showing cached results
        </div>` : '';

    const hashStyles = `
    <style>
        .dash-topbar { display:flex; justify-content:flex-end; align-items:center; gap:16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
        .dash-topbar-icon { background:transparent; border:1px solid var(--border-color); color:var(--text-primary); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s; }
        .dash-topbar-icon:hover { background:var(--bg-secondary); }
        .dash-avatar { width:40px; height:40px; border-radius:50%; background: linear-gradient(135deg, var(--accent-purple), var(--primary-color)); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; cursor:pointer; }
        
        .dash-layout { display:flex; gap: 32px; align-items:flex-start; }
        .dash-main { flex: 1.8; min-width:0; }
        .dash-rail { width: 340px; flex-shrink:0; display:flex; flex-direction:column; gap:24px; position: sticky; top: 24px; align-self: start; }

        @media (max-width: 1024px) {
            .dash-layout { flex-direction:column; }
            .dash-rail { width: 100%; position: static; }
        }

        .chip-group-wrap { display:flex; flex-wrap:wrap; gap:8px; }
        .gen-chip { 
            padding: 8px 16px; border-radius: 999px; background: var(--bg-card); 
            border: 1px solid var(--border-color); color: var(--text-secondary); 
            font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
            display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .gen-chip:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .gen-chip.selected { 
            background: rgba(139, 92, 246, 0.15);
            border: 1px solid var(--primary-color); 
            color: var(--text-primary);
        }

        .gen-textarea-wrapper {
            position: relative; background: var(--bg-input); border: 1px solid var(--border-color);
            border-radius: 12px; padding: 16px; transition: border-color 0.2s;
        }
        .gen-textarea-wrapper:focus-within { border-color: var(--primary-color); }
        .gen-textarea {
            width: 100%; min-height: 120px; background: transparent; border: none; outline: none;
            color: var(--text-primary); font-family: 'Inter', sans-serif; resize: none;
            line-height: 1.5; font-size: 0.95rem; margin-bottom: 24px; overflow: hidden;
        }
        .gen-textarea-footer {
            position: absolute; bottom: 12px; right: 16px; display: flex;
            justify-content: flex-end; align-items: center; pointer-events: none;
        }
        
        .gradient-icon-chip {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
            color: var(--primary-color);
            border: 1px solid rgba(139, 92, 246, 0.2);
            width: 48px; height: 48px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 16px;
        }
        .hashtag-list-chip {
            display: inline-block; padding: 6px 12px; border-radius: 6px;
            background: var(--bg-input); border: 1px solid var(--border-color);
            font-size: 0.85rem; color: var(--text-primary); margin-right: 6px; margin-bottom: 8px;
            cursor: pointer; transition: 0.2s;
        }
        .hashtag-list-chip:hover { border-color: var(--primary-color); color: var(--primary-color); }
    </style>`;

    container.innerHTML = `
    ${hashStyles}
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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                    </div>
                    <div>
                        <h1 style="font-family: 'Space Grotesk', sans-serif; font-size:2.2rem; margin-bottom:4px; font-weight:700;">Smart Hashtags</h1>
                        <p style="color:var(--text-secondary); font-size:1.05rem; margin:0;">AI-powered reach optimization.</p>
                    </div>
                </div>
                ${offlineBanner}

                <div class="card" style="border: 1px solid var(--border-color);">
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Post Description</label>
                        <div class="gen-textarea-wrapper">
                            <textarea class="gen-textarea" id="hash-desc" placeholder="What is your post about?" maxlength="300">${escapeHtml(state.content)}</textarea>
                            <div class="gen-textarea-footer">
                                <span id="hash-char-count" style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:var(--text-tertiary);">0/300</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group mt-xl">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Content Type</label>
                        <div class="chip-group-wrap" id="hash-type-chips">
                            ${typeChips}
                        </div>
                    </div>

                    <div class="form-group mt-xl">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Niche</label>
                        <div class="chip-group-wrap" id="hash-niche-chips">
                            ${nicheChips}
                        </div>
                    </div>

                    <div class="mt-xl">
                        <button class="btn btn-primary" id="hash-gen-btn" style="width:100%; padding: 16px; font-size:1.1rem; border-radius: 12px;">
                            <span class="btn-text">Generate Tags 🚀</span>
                        </button>
                    </div>
                </div>
                
                <div id="caption-result-container"></div>
            </div>

            <!-- RIGHT RAIL (RESULTS) -->
            <div class="dash-rail">
                <div class="card" style="padding: 24px;" id="hash-results-panel">
                    <!-- Default Empty State -->
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; opacity: 0.5;"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                        <p style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">Ready to optimize</p>
                        <p style="font-size:0.85rem;">Your hashtags will appear here,<br>grouped by reach potential.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.getElementById('dash-theme-btn')?.addEventListener('click', () => {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        renderHashtagsPage(container);
    });

    const descInput = document.getElementById('hash-desc');
    descInput.oninput = e => { 
        state.content = e.target.value; 
        updateCharCount(e.target.value.length);
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    };
    
    // Initial auto-grow
    setTimeout(() => {
        if(descInput.value) {
            descInput.style.height = 'auto';
            descInput.style.height = (descInput.scrollHeight) + 'px';
            updateCharCount(descInput.value.length);
        }
    }, 0);

    document.getElementById('hash-type-chips').onclick = e => {
        const c = e.target.closest('.gen-chip'); if (!c) return;
        state.type = c.dataset.type;
        container.querySelectorAll('#hash-type-chips .gen-chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    };
    document.getElementById('hash-niche-chips').onclick = e => {
        const c = e.target.closest('.gen-chip'); if (!c) return;
        state.niche = c.dataset.niche;
        container.querySelectorAll('#hash-niche-chips .gen-chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    };
    document.getElementById('hash-gen-btn').onclick = handleGenerateHashtags;

    if (state.results) renderHashResults();
    else if (isOffline() && cached) { state.results = cached.data.groups; state.caption = cached.data.caption; renderHashResults(); }
}

function updateCharCount(len) {
    const el = document.getElementById('hash-char-count');
    if (!el) return;
    el.textContent = `${len}/300`;
    el.style.color = len > 280 ? 'var(--accent-red)' : len > 200 ? 'var(--accent-orange)' : 'var(--text-tertiary)';
}

async function handleGenerateHashtags() {
    if (!state.content.trim()) { showToast('Please enter a description!', 'error'); return; }
    if (!getApiKey()) { showToast('Set API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) { showToast('Daily limit reached.', 'error'); return; }

    const btn = document.getElementById('hash-gen-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    
    document.getElementById('hash-results-panel').innerHTML = `
        <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 24px;">Analyzing...</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
            ${Array(3).fill('').map(() => `
            <div>
                <div class="skeleton skeleton-line" style="width:40%; margin-bottom:12px;"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line" style="width:70%"></div>
            </div>`).join('')}
        </div>`;

    try {
        const voice = getBrandVoice();
        const nicheName = NICHES.find(n => n.id === state.niche)?.label || state.niche;
        const typeName = CONTENT_TYPES.find(t => t.id === state.type)?.label || state.type;
        const context = voice.name ? `${state.content} (Brand Name: ${voice.name})` : state.content;
        
        const data = await generateSmartHashtags(context, nicheName, typeName);
        state.results = data.groups;
        state.caption = data.caption;
        incrementUsage();
        cacheContent('hashtags', { groups: data.groups, caption: data.caption });
        renderHashResults();
    } catch (err) {
        showToast(err.message === 'RATE_LIMITED' ? 'Rate limited, wait a moment' : 'Generation failed', 'error');
        document.getElementById('hash-results-panel').innerHTML = '<div style="color:var(--accent-red); padding:20px;">Generation failed. Please try again.</div>';
    } finally {
        btn.classList.remove('btn-loading'); btn.disabled = false;
    }
}

function renderHashResults() {
    const p = document.getElementById('hash-results-panel');
    const c = document.getElementById('caption-result-container');
    if (!state.results || !p) return;
    
    const cats = [
        { label: 'Mega Reach', tags: state.results.high },
        { label: 'Macro Reach', tags: state.results.medium },
        { label: 'Micro Reach', tags: state.results.niche },
        { label: 'Trending Style', tags: state.results.trending }
    ];
    
    const allTags = [...state.results.high, ...state.results.medium, ...state.results.niche, ...state.results.trending].join(' ');

    p.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.2rem; margin:0;">Generated Tags</h3>
            <button class="btn btn-sm btn-primary" onclick="window.copyToClipboard('${escapeAttr(allTags)}')">📋 Copy All</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:24px;">
            ${cats.map(cat => {
                if(!cat.tags || cat.tags.length === 0) return '';
                const groupTags = cat.tags.join(' ');
                return `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">${cat.label}</span>
                        <button class="btn-icon" style="width:28px; height:28px;" title="Copy this group" onclick="window.copyToClipboard('${escapeAttr(groupTags)}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                    <div>
                        ${cat.tags.map(t => `<span class="hashtag-list-chip" onclick="window.copyToClipboard('${escapeAttr(t)}')">${escapeHtml(t)}</span>`).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div>
        <button class="btn btn-secondary w-100" style="margin-top:24px;" onclick="window.saveHashtagSet()">💾 Save to Library</button>
    `;

    if(c && state.caption) {
        c.innerHTML = `
        <div class="card mt-xl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin:0;">📝 AI Caption Suggestion</h3>
                <div style="display:flex; gap:8px;">
                    <button class="btn-icon" title="Copy Caption" onclick="window.copyToClipboard('${escapeAttr(state.caption)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                    <button class="btn-icon" title="Save Caption" onclick="window.saveCaptionSet()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></button>
                </div>
            </div>
            <div style="font-family:'Inter', sans-serif; font-size:0.95rem; line-height:1.6; color:var(--text-primary); white-space:pre-wrap;">${escapeHtml(state.caption)}</div>
        </div>`;
    }
}

window.copyToClipboard = (txt) => copyToClipboard(txt);
window.saveHashtagSet = () => {
    const allTags = [...state.results.high, ...state.results.medium, ...state.results.niche, ...state.results.trending].join(' ');
    saveHashtag(allTags, state.content.slice(0, 30) + '…');
    showToast('Hashtag set saved!', 'success');
};
window.saveCaptionSet = () => {
    saveCaption(state.caption);
    showToast('Caption saved!', 'success');
};
