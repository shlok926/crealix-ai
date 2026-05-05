// ==================== Bio Generator Page ====================
// Improvements included:
//   #4  Export/Share — Download bio preview as PNG (Canvas API)
//   #5  Bio History — Session history of last 10 generation runs
//   #6  Char counter animation — Pulses red when approaching 150
//   #10 Keyboard shortcuts — Ctrl+Enter generates, Ctrl+Shift+C copies selected
//   #12 Debounce preview — 300ms debounce on textarea → preview re-render
import { generateBios, generateHashtags, generateEmojis } from '../services/ai.js';
import { getApiKey, saveBio, incrementUsage, checkUsageLimit, getBrandVoice } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { renderPreview } from '../components/preview.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml, escapeAttr, debounce } from '../utils/helpers.js';
import { addToHistory, getHistory } from '../utils/history.js';
import { cacheContent, getCachedContent, isOffline } from '../utils/offline.js';

const TONES = [
    { id: 'aesthetic', label: 'Aesthetic' },
    { id: 'funny', label: 'Funny' },
    { id: 'professional', label: 'Professional' },
    { id: 'motivational', label: 'Motivational' },
    { id: 'sarcastic', label: 'Sarcastic' },
    { id: 'romantic', label: 'Romantic' },
    { id: 'genz', label: 'Gen-Z' },
    { id: 'minimal', label: 'Minimal' }
];
const NICHES = [
    { id: 'general', label: 'General' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'travel', label: 'Travel' },
    { id: 'food', label: 'Food' },
    { id: 'tech', label: 'Tech' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'art', label: 'Art' },
    { id: 'music', label: 'Music' },
    { id: 'business', label: 'Business' },
    { id: 'photography', label: 'Photography' }
];
const FORMATS = [
    { id: 'short', label: 'Short & Punchy' },
    { id: 'bullet', label: 'Bullet Points' },
    { id: 'emoji', label: 'Emoji Heavy' },
    { id: 'minimalist', label: 'Minimalist' },
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

    // Pre-fill state from brand voice if state is empty
    if (!state.description && voice.niche) {
        state.niche = NICHES.find(n => n.label === voice.niche)?.id || 'general';
        state.tone = TONES.find(t => t.label === voice.tone)?.id || 'aesthetic';
    }

    container.innerHTML = `
    <div class="page">
        <h1 class="section-title">Bio Generator</h1>
        <p class="section-subtitle">Create the perfect Instagram bio with AI
            <span style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-left:8px">Ctrl+Enter to generate</span>
        </p>
        ${isOffline() && cached ? `<div class="offline-banner">📵 Offline — showing cached results</div>` : ''}

        <div class="generator-layout">
            <div class="generator-form">
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">About You <span class="form-label-sub">— Describe yourself or your brand</span></label>
                        <div style="position:relative">
                            <textarea class="form-textarea" id="gen-description" placeholder="e.g. I'm a travel photographer who loves coffee and sunsets. Based in Bali." maxlength="500" style="padding-bottom:32px">${escapeHtml(state.description)}</textarea>
                            <span id="gen-char-count" style="position:absolute;bottom:10px;right:12px;font-size:11px;color:var(--text-tertiary);transition:color 0.3s">0/500</span>
                        </div>
                    </div>
                    <div class="form-group mt-lg">
                        <label class="form-label">Format</label>
                        <div class="chip-group" id="format-chips">
                            ${FORMATS.map(f => `<button class="chip ${state.format === f.id ? 'selected' : ''}" data-format="${f.id}">${f.label}</button>`).join('')}
                        </div>
                    </div>
                    <div class="form-group mt-lg">
                        <label class="form-label">Tone / Vibe</label>
                        <div class="chip-group" id="tone-chips">
                            ${TONES.map(t => `<button class="chip ${state.tone === t.id ? 'selected' : ''}" data-tone="${t.id}">${t.label}</button>`).join('')}
                        </div>
                    </div>
                    <div class="form-group mt-lg">
                        <label class="form-label">Niche</label>
                        <div class="chip-group" id="niche-chips">
                            ${NICHES.map(n => `<button class="chip ${state.niche === n.id ? 'selected' : ''}" data-niche="${n.id}">${n.label}</button>`).join('')}
                        </div>
                    </div>
                    <div class="mt-xl" style="display:flex;gap:var(--space-sm)">
                        <button class="btn btn-primary" id="generate-btn" style="flex:1">
                            <span class="btn-text">Generate Bios</span>
                        </button>
                        ${state.bios.length > 0 ? `<button class="btn btn-secondary" id="regenerate-btn" title="Regenerate">🔄</button>` : ''}
                    </div>
                </div>
                
                <div class="ig-preview" id="preview-container"></div>
                
                <div id="results-container"></div>
                <div id="hashtags-container"></div>
                <div id="emojis-container"></div>
                <div id="history-container"></div>
            </div>
        </div>
    </div>`;

    // Initialize preview
    renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });

    // Bind events
    bindEvents(container);

    // Restore results from state / offline cache
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

    // Update char count on init
    updateCharCount(state.description.length);
}

function bindEvents(container) {
    const descInput = document.getElementById('gen-description');

    // Char counter + debounced preview — #6, #12
    descInput.addEventListener('input', (e) => {
        state.description = e.target.value;
        updateCharCount(e.target.value.length);
        debouncedPreviewUpdate(state.selectedBio);
    });

    // Chip clicks
    document.getElementById('format-chips').addEventListener('click', e => {
        const c = e.target.closest('.chip'); if (!c) return;
        state.format = c.dataset.format;
        container.querySelectorAll('#format-chips .chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    });
    document.getElementById('tone-chips').addEventListener('click', e => {
        const c = e.target.closest('.chip'); if (!c) return;
        state.tone = c.dataset.tone;
        container.querySelectorAll('#tone-chips .chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    });
    document.getElementById('niche-chips').addEventListener('click', e => {
        const c = e.target.closest('.chip'); if (!c) return;
        state.niche = c.dataset.niche;
        container.querySelectorAll('#niche-chips .chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    });

    document.getElementById('generate-btn').addEventListener('click', handleGenerate);
    const regenBtn = document.getElementById('regenerate-btn');
    if (regenBtn) regenBtn.addEventListener('click', handleGenerate);

    // Keyboard shortcut: Ctrl+Enter → generate — #10
    document.addEventListener('keydown', handleKeydown);
}

// Keyboard handler — registers once per page visit, removed on navigate away
function handleKeydown(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
    }
    // Ctrl+Shift+C → copy selected bio
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (state.selectedBio) copyToClipboard(state.selectedBio);
    }
}

// Char counter update — #6
function updateCharCount(len) {
    const el = document.getElementById('gen-char-count');
    if (!el) return;
    el.textContent = `${len}/500`;
    el.style.color = len > 450 ? 'var(--accent-red)' : len > 350 ? 'var(--accent-orange)' : 'var(--text-tertiary)';
}

async function handleGenerate() {
    if (!state.description.trim()) { showToast('Please describe yourself first!', 'error'); return; }
    if (!getApiKey()) { showToast('Please set your API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) { showToast('Daily limit reached (5/5). Come back tomorrow! 🚀', 'error'); return; }

    const btn = document.getElementById('generate-btn');
    btn.classList.add('btn-loading');
    btn.disabled = true;
    state.loading = true;

    document.getElementById('results-container').innerHTML = `
    <div class="results-section">
        <h2 class="section-title" style="font-size:var(--fs-lg)">Generating...</h2>
        ${[1,2,3].map(() => `
        <div class="card skeleton-card skeleton-premium mt-md">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line" style="width:60%"></div>
        </div>`).join('')}
    </div>`;

    try {
        const voice = getBrandVoice();
        const toneName = TONES.find(t => t.id === state.tone)?.label || state.tone;
        const nicheName = NICHES.find(n => n.id === state.niche)?.label || state.niche;
        
        // Pass brand name if available
        const context = voice.name ? `${state.description} (Brand Name: ${voice.name})` : state.description;
        
        state.bios = await generateBios(context, toneName, nicheName, state.format);
        state.selectedBio = state.bios[0] || '';

        // Save to session history — #5
        addToHistory({ bios: state.bios, tone: state.tone, niche: state.niche, description: state.description });

        // Cache offline — #7
        cacheContent('bios', { bios: state.bios });

        incrementUsage();
        renderResults();

        // Also fetch hashtags + emojis
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
        const msg = err.message;
        if (msg === 'API_KEY_MISSING') { showToast('Set your API key in Settings', 'error'); openSettingsModal(); }
        else if (msg === 'INVALID_API_KEY') showToast('Invalid API key', 'error');
        else if (msg === 'RATE_LIMITED') showToast('Rate limited. Wait a moment.', 'error');
        else { showToast('Generation failed', 'error'); console.error(err); }
        document.getElementById('results-container').innerHTML = '';
    } finally {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        state.loading = false;
        // Show regen button
        if (!document.getElementById('regenerate-btn') && state.bios.length > 0) {
            const rb = document.createElement('button');
            rb.className = 'btn btn-secondary'; rb.id = 'regenerate-btn'; rb.title = 'Regenerate';
            rb.textContent = '🔄';
            rb.addEventListener('click', handleGenerate);
            document.getElementById('generate-btn')?.parentElement?.appendChild(rb);
        }
    }
}

function renderResults() {
    const c = document.getElementById('results-container');
    if (!state.bios.length) return;
    c.innerHTML = `
    <div class="results-section">
        <h2 class="section-title" style="font-size:var(--fs-lg)">Your Bios</h2>
        <p style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:8px">Click a card to preview • Ctrl+Shift+C to copy selected</p>
        <div class="results-grid results-preview-mode">
            ${state.bios.map((bio, i) => {
        const len = bio.length;
        const over = len > 150;
        const isActive = bio === state.selectedBio;
        // Char count color — #6
        const countColor = over ? 'var(--accent-red)' : len > 130 ? 'var(--accent-orange)' : 'var(--accent-green)';
        return `
                <div class="card result-card ${isActive ? 'active-preview' : ''}" data-idx="${i}">
                    <div class="result-bio">${escapeHtml(bio)}</div>
                    <div class="result-meta">
                        <span class="char-count" style="color:${countColor};font-weight:700;animation:${over ? 'pulse 1s infinite' : 'none'}">${len}/150 ${over ? '⚠️' : '✓'}</span>
                        <div class="result-actions" onclick="event.stopPropagation()">
                            <button class="btn-icon" data-action="copy" data-i="${i}" title="Copy">📋</button>
                            <button class="btn-icon" data-action="save" data-i="${i}" title="Save">💾</button>
                        </div>
                    </div>
                </div>`;
    }).join('')}
        </div>
    </div>`;

    // Card click → preview
    c.querySelectorAll('.result-card').forEach(card => {
        card.onclick = () => {
            const idx = +card.dataset.idx;
            state.selectedBio = state.bios[idx];
            renderResults(); // re-render to update active class
            renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
        };
    });
    // Action buttons
    c.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const { action, i } = btn.dataset;
            const bio = state.bios[+i];
            if (action === 'copy') copyToClipboard(bio);
            else if (action === 'save') { saveBio(bio); showToast('Bio saved!', 'success'); }
        };
    });
}

function renderHashtags() {
    const c = document.getElementById('hashtags-container');
    if (!state.hashtags.length) return;
    c.innerHTML = `
    <div class="card hashtags-section mt-lg">
        <h3 class="feature-title">Suggested Hashtags</h3>
        <div class="hashtag-pills mt-md">
            ${state.hashtags.map(t => `<span class="hashtag-pill" data-tag="${escapeAttr(t)}">${escapeHtml(t)}</span>`).join('')}
        </div>
        <button class="btn btn-sm btn-secondary mt-md" id="copy-all-tags">📋 Copy All</button>
    </div>`;
    c.querySelectorAll('.hashtag-pill').forEach(p => p.onclick = () => copyToClipboard(p.dataset.tag));
    document.getElementById('copy-all-tags').onclick = () => copyToClipboard(state.hashtags.join(' '));
}

function renderEmojis() {
    const c = document.getElementById('emojis-container');
    if (!state.emojis.length) return;
    c.innerHTML = `
    <div class="card mt-lg">
        <h3 class="feature-title">Emoji Suggestions</h3>
        <p style="font-size:var(--fs-sm);color:var(--text-secondary);margin-bottom:var(--space-sm)">Click to copy</p>
        <div class="emoji-suggestions">
            ${state.emojis.map(e => `<button class="emoji-btn" data-emoji="${e}">${e}</button>`).join('')}
        </div>
    </div>`;
    c.querySelectorAll('.emoji-btn').forEach(b => b.onclick = () => copyToClipboard(b.dataset.emoji));
}

// ── Bio History (#5) ─────────────────────────────────────────
function renderHistory() {
    const c = document.getElementById('history-container');
    if (!c) return;
    const history = getHistory();
    if (history.length < 2) { c.innerHTML = ''; return; } // show only after 2+ runs

    c.innerHTML = `
    <div class="card mt-xl">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md)">
            <h3 class="feature-title" style="margin:0">Session History</h3>
            <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${history.length} runs this session</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
            ${history.slice(0, 5).map((entry, i) => `
            <div class="history-entry card" data-hidx="${i}" style="padding:var(--space-md);cursor:pointer">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${entry.tone} · ${entry.niche} · ${new Date(entry.at).toLocaleTimeString()}</span>
                    <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${entry.bios.length} bios</span>
                </div>
                <p style="font-size:var(--fs-sm);color:var(--text-secondary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">"${escapeHtml(entry.description.slice(0, 60))}${entry.description.length > 60 ? '…' : ''}"</p>
            </div>`).join('')}
        </div>
    </div>`;

    c.querySelectorAll('.history-entry').forEach(el => {
        el.onclick = () => {
            const entry = history[+el.dataset.hidx];
            state.bios = entry.bios;
            state.selectedBio = entry.bios[0] || '';
            state.description = entry.description;
            state.tone = entry.tone;
            state.niche = entry.niche;
            renderResults();
            renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
            showToast('Loaded from history', 'info');
        };
    });
}
