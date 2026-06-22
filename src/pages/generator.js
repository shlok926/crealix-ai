// ==================== Bio Generator Page ====================
import { generateBios, generateHashtags, generateEmojis } from '../services/ai.js';
import { getApiKey, saveBio, incrementUsage, checkUsageLimit, getBrandVoice, getTheme, setTheme } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { renderPreview } from '../components/preview.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml, escapeAttr, debounce } from '../utils/helpers.js';
import { addToHistory, getHistory } from '../utils/history.js';
import { cacheContent, getCachedContent, isOffline } from '../utils/offline.js';
import { auth } from '../services/firebase.js';

const TONES = [
    { id: 'aesthetic', label: 'Aesthetic', color: '#8B5CF6' }, // violet
    { id: 'funny', label: 'Funny', color: '#F5A623' },       // amber
    { id: 'professional', label: 'Professional', color: '#3B82F6' },
    { id: 'motivational', label: 'Motivational', color: '#10B981' },
    { id: 'sarcastic', label: 'Sarcastic', color: '#EC4899' }, // magenta
    { id: 'romantic', label: 'Romantic', color: '#F43F5E' },
    { id: 'genz', label: 'Gen-Z', color: '#06B6D4' },
    { id: 'minimal', label: 'Minimal', color: '#9CA3AF' }
];

const NICHES = [
    { id: 'general', label: 'General' }, { id: 'fitness', label: 'Fitness' },
    { id: 'travel', label: 'Travel' }, { id: 'food', label: 'Food' },
    { id: 'tech', label: 'Tech' }, { id: 'fashion', label: 'Fashion' },
    { id: 'art', label: 'Art' }, { id: 'music', label: 'Music' },
    { id: 'business', label: 'Business' }, { id: 'photography', label: 'Photography' }
];

const FORMATS = [
    { id: 'short', label: 'Short & Punchy' }, { id: 'bullet', label: 'Bullet Points' },
    { id: 'emoji', label: 'Emoji Heavy' }, { id: 'minimalist', label: 'Minimalist' },
    { id: 'cta', label: 'With CTA' }
];

let state = {
    description: '', tone: 'aesthetic', niche: 'general', format: 'bullet',
    bios: [], hashtags: [], emojis: [], selectedBio: '', loading: false
};

const debouncedPreviewUpdate = debounce((bio) => {
    const pc = document.getElementById('preview-container');
    if (pc) renderPreview(pc, { bio });
}, 300);

export function renderGenerator(container) {
    const cached = getCachedContent('bios');
    const voice = getBrandVoice();
    const user = auth.currentUser;
    const name = user?.displayName ? user.displayName.split(' ')[0] : 'Creator';
    const isDark = getTheme() === 'dark';

    if (!state.description && voice.niche) {
        state.niche = NICHES.find(n => n.label === voice.niche)?.id || 'general';
        state.tone = TONES.find(t => t.label === voice.tone)?.id || 'aesthetic';
    }

    const genStyles = `
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

        /* Pills */
        .chip-group-wrap { display:flex; flex-wrap:wrap; gap:8px; }
        .gen-chip { 
            padding: 8px 16px; border-radius: 999px; background: var(--bg-card); 
            border: 1px solid var(--border-color); color: var(--text-secondary); 
            font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
            display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .gen-chip:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .gen-chip.selected { 
            background: rgba(139, 92, 246, 0.15); /* Tinted background */
            border: 1px solid var(--primary-color); 
            color: var(--text-primary);
        }

        /* Specific formats */
        .chip-format { border-radius: 8px; }
        .chip-tone .tone-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

        /* Textarea custom */
        .gen-textarea-wrapper {
            position: relative; background: var(--bg-input); border: 1px solid var(--border-color);
            border-radius: 12px; padding: 16px; transition: border-color 0.2s;
        }
        .gen-textarea-wrapper:focus-within { border-color: var(--primary-color); }
        .gen-textarea {
            width: 100%; min-height: 120px; background: transparent; border: none; outline: none;
            color: var(--text-primary); font-family: 'Inter', sans-serif; resize: vertical;
            line-height: 1.5; font-size: 0.95rem; margin-bottom: 24px;
        }
        .gen-textarea::-webkit-scrollbar { width: 8px; }
        .gen-textarea::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        .gen-textarea-footer {
            position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex;
            justify-content: space-between; align-items: center; pointer-events: none;
        }
        
        .results-grid-cards { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
        .bio-variant-card { 
            background: var(--bg-secondary); border: 1px solid var(--border-color); 
            border-radius: 12px; padding: 20px; transition: 0.2s;
        }
        .bio-variant-card:hover { border-color: var(--primary-color); }
        .bio-variant-text { font-family: 'Inter', sans-serif; font-size: 0.95rem; white-space: pre-wrap; line-height: 1.5; color: var(--text-primary); margin-bottom: 16px; }
    </style>`;

    container.innerHTML = `
    ${genStyles}
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
                <div style="margin-bottom: 32px;">
                    <h1 style="font-family: 'Space Grotesk', sans-serif; font-size:2.2rem; margin-bottom:8px; font-weight:700;">Bio Generator</h1>
                    <p style="color:var(--text-secondary); font-size:1.05rem;">Craft optimized, highly-converting Instagram bios using AI.</p>
                </div>
                ${isOffline() && cached ? `<div class="offline-banner" style="margin-bottom:24px;">📵 Offline — showing cached results</div>` : ''}

                <div class="card">
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">About You</label>
                        <div class="gen-textarea-wrapper">
                            <textarea class="gen-textarea" id="gen-description" placeholder="e.g. I'm a travel photographer who loves coffee and sunsets. Based in Bali.">${escapeHtml(state.description)}</textarea>
                            <div class="gen-textarea-footer">
                                <span style="font-size:0.75rem; color:var(--text-tertiary); background:var(--bg-primary); padding:2px 6px; border-radius:4px; border:1px solid var(--border-color);">Ctrl + Enter to generate</span>
                                <span id="gen-char-count" style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:var(--text-tertiary);">0/500</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group mt-xl">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Format</label>
                        <div class="chip-group-wrap" id="format-chips">
                            ${FORMATS.map(f => `<button class="gen-chip chip-format ${state.format === f.id ? 'selected' : ''}" data-format="${f.id}">${f.label}</button>`).join('')}
                        </div>
                    </div>

                    <div class="form-group mt-xl">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Tone / Vibe</label>
                        <div class="chip-group-wrap" id="tone-chips">
                            ${TONES.map(t => `<button class="gen-chip chip-tone ${state.tone === t.id ? 'selected' : ''}" data-tone="${t.id}"><span class="tone-dot" style="background:${t.color}"></span> ${t.label}</button>`).join('')}
                        </div>
                    </div>

                    <div class="form-group mt-xl">
                        <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Niche</label>
                        <div class="chip-group-wrap" id="niche-chips">
                            ${NICHES.map(n => `<button class="gen-chip ${state.niche === n.id ? 'selected' : ''}" data-niche="${n.id}">${n.label}</button>`).join('')}
                        </div>
                    </div>

                    <div class="mt-xl">
                        <button class="btn btn-primary" id="generate-btn" style="width:100%; padding: 16px; font-size:1.1rem; border-radius: 12px;">
                            <span class="btn-text">Generate Bios ✨</span>
                        </button>
                    </div>
                </div>

                <div id="results-container"></div>
                <div id="hashtags-container"></div>
                <div id="emojis-container"></div>
            </div>

            <!-- RIGHT RAIL -->
            <div class="dash-rail">
                <div id="preview-container"></div>
                
                <div class="card" style="padding: 24px;">
                    <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 16px; display:flex; align-items:center; gap:8px;">
                        💡 Pro Tips
                    </h3>
                    <ul style="color:var(--text-secondary); font-size:0.85rem; padding-left:16px; display:flex; flex-direction:column; gap:12px; margin:0;">
                        <li><strong>Be specific:</strong> Instead of "I like food", try "Vegan baker obsessed with sourdough."</li>
                        <li><strong>Call to Action:</strong> Always choose the "With CTA" format if you want users to click your link.</li>
                        <li><strong>Vibe matching:</strong> Match your Tone to your target audience (Gen-Z for younger demographics).</li>
                    </ul>
                </div>

                <div id="history-container"></div>
            </div>
        </div>
    </div>`;

    document.getElementById('dash-theme-btn')?.addEventListener('click', () => {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        renderGenerator(container); // Re-render to update UI
    });

    renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
    bindEvents(container);

    if (state.bios.length > 0) {
        renderResults();
        if (state.hashtags.length > 0) renderHashtags();
        if (state.emojis.length > 0) renderEmojis();
    } else if (isOffline() && cached) {
        state.bios = cached.data.bios || [];
        state.selectedBio = state.bios[0] || '';
        if (state.bios.length) { renderResults(); renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio }); }
    }

    renderHistory();
    updateCharCount(state.description.length);
}

function bindEvents(container) {
    const descInput = document.getElementById('gen-description');

    descInput.addEventListener('input', (e) => {
        state.description = e.target.value;
        updateCharCount(e.target.value.length);
        debouncedPreviewUpdate(state.selectedBio);
    });

    document.getElementById('format-chips').addEventListener('click', e => {
        const c = e.target.closest('.gen-chip'); if (!c) return;
        state.format = c.dataset.format;
        container.querySelectorAll('#format-chips .gen-chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    });
    document.getElementById('tone-chips').addEventListener('click', e => {
        const c = e.target.closest('.gen-chip'); if (!c) return;
        state.tone = c.dataset.tone;
        container.querySelectorAll('#tone-chips .gen-chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    });
    document.getElementById('niche-chips').addEventListener('click', e => {
        const c = e.target.closest('.gen-chip'); if (!c) return;
        state.niche = c.dataset.niche;
        container.querySelectorAll('#niche-chips .gen-chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    });

    document.getElementById('generate-btn').addEventListener('click', handleGenerate);
    document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
    }
}

function updateCharCount(len) {
    const el = document.getElementById('gen-char-count');
    if (!el) return;
    el.textContent = `${len}/500`;
    el.style.color = len > 450 ? 'var(--accent-red)' : len > 350 ? 'var(--accent-orange)' : 'var(--text-tertiary)';
}

async function handleGenerate() {
    if (!state.description.trim()) { showToast('Please describe yourself first!', 'error'); return; }
    if (!getApiKey()) { showToast('Please set your API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) { showToast('Daily limit reached.', 'error'); return; }

    const btn = document.getElementById('generate-btn');
    btn.classList.add('btn-loading');
    btn.disabled = true;
    state.loading = true;

    document.getElementById('results-container').innerHTML = `
    <div class="results-grid-cards">
        ${[1,2,3].map(() => `
        <div class="bio-variant-card">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line" style="width:60%"></div>
        </div>`).join('')}
    </div>`;

    try {
        const voice = getBrandVoice();
        const toneName = TONES.find(t => t.id === state.tone)?.label || state.tone;
        const nicheName = NICHES.find(n => n.id === state.niche)?.label || state.niche;
        const context = voice.name ? `${state.description} (Brand Name: ${voice.name})` : state.description;
        
        state.bios = await generateBios(context, toneName, nicheName, state.format);
        state.selectedBio = state.bios[0] || '';

        addToHistory({ bios: state.bios, tone: state.tone, niche: state.niche, description: state.description });
        cacheContent('bios', { bios: state.bios });
        incrementUsage();
        renderResults();

        if (state.bios.length > 0) {
            try {
                const [hashtags, emojis] = await Promise.all([
                    generateHashtags(state.bios[0]),
                    generateEmojis(state.bios[0])
                ]);
                state.hashtags = hashtags;
                state.emojis = emojis;
                renderHashtags();
                renderEmojis();
            } catch (e) { console.warn('Hashtags/emojis failed:', e); }
        }

        renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
        renderHistory();

    } catch (err) {
        showToast(err.message, 'error');
        document.getElementById('results-container').innerHTML = '';
    } finally {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        state.loading = false;
    }
}

function renderResults() {
    const c = document.getElementById('results-container');
    if (!state.bios.length) return;
    
    c.innerHTML = `
    <h2 style="font-family:'Space Grotesk', sans-serif; font-size:1.4rem; margin-top:40px;">Generated Bios</h2>
    <div class="results-grid-cards">
        ${state.bios.map((bio, i) => {
        return `
            <div class="bio-variant-card" style="cursor:pointer;" onclick="previewVariant(${i})">
                <div class="bio-variant-text">${escapeHtml(bio)}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px; margin-top:16px;">
                    <span style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:var(--text-tertiary)">Variant ${i+1}</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-icon" onclick="event.stopPropagation(); copyToClipboard('${escapeAttr(bio)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                        <button class="btn-icon" onclick="event.stopPropagation(); saveBioAndToast('${escapeAttr(bio)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></button>
                        <button class="btn-icon" onclick="event.stopPropagation(); window.regenerateCurrent()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg></button>
                    </div>
                </div>
            </div>`;
    }).join('')}
    </div>`;
}

window.saveBioAndToast = (bio) => {
    saveBio(bio);
    showToast('Bio saved to Library!', 'success');
}

window.regenerateCurrent = () => {
    handleGenerate();
}

window.previewVariant = (idx) => {
    state.selectedBio = state.bios[idx];
    renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
}

function renderHashtags() {
    const c = document.getElementById('hashtags-container');
    if (!state.hashtags.length) return;
    c.innerHTML = `
    <div class="card mt-xl">
        <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom:16px;">Suggested Hashtags</h3>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${state.hashtags.map(t => `<span class="gen-chip" style="cursor:pointer" onclick="copyToClipboard('${escapeAttr(t)}')">${escapeHtml(t)}</span>`).join('')}
        </div>
        <button class="btn btn-sm btn-secondary mt-md" onclick="copyToClipboard('${escapeAttr(state.hashtags.join(' '))}')">📋 Copy All</button>
    </div>`;
}

function renderEmojis() {
    const c = document.getElementById('emojis-container');
    if (!state.emojis.length) return;
    c.innerHTML = `
    <div class="card mt-xl">
        <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom:8px;">Emoji Suggestions</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">Click to copy</p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
            ${state.emojis.map(e => `<button style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="copyToClipboard('${e}')">${e}</button>`).join('')}
        </div>
    </div>`;
}

function renderHistory() {
    const c = document.getElementById('history-container');
    if (!c) return;
    const history = getHistory();
    if (history.length === 0) { c.innerHTML = ''; return; }

    c.innerHTML = `
    <div class="card" style="padding: 24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem;">Recent bios</h3>
            <span style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:var(--text-tertiary)">${history.length}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${history.slice(0, 3).map((entry, i) => `
            <div style="padding:12px; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px;">
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:8px;">
                    ${entry.tone} · ${entry.niche}
                </div>
                <p style="font-size:0.85rem; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:12px;">"${escapeHtml(entry.description)}"</p>
                <button class="btn btn-sm btn-secondary" style="width:100%;" onclick="window.loadHistory(${i})">Reuse Settings</button>
            </div>`).join('')}
        </div>
    </div>`;
}

window.loadHistory = (idx) => {
    const entry = getHistory()[idx];
    state.bios = entry.bios;
    state.selectedBio = entry.bios[0] || '';
    state.description = entry.description;
    state.tone = entry.tone;
    state.niche = entry.niche;
    
    // Update UI elements
    document.getElementById('gen-description').value = state.description;
    updateCharCount(state.description.length);
    
    // Update selected chips
    const chips = document.querySelectorAll('.gen-chip');
    chips.forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-tone="${state.tone}"]`)?.classList.add('selected');
    document.querySelector(`[data-niche="${state.niche}"]`)?.classList.add('selected');
    
    renderResults();
    renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
    showToast('Loaded from history', 'info');
}
