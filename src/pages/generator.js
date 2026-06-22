// ==================== Bio Generator Page ====================
import { generateBios, generateHashtags, generateEmojis } from '../services/ai.js';
import { getApiKey, saveBio, incrementUsage, checkUsageLimit, getBrandVoice } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { renderPreview } from '../components/preview.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml, escapeAttr, debounce } from '../utils/helpers.js';
import { addToHistory, getHistory } from '../utils/history.js';
import { cacheContent, getCachedContent, isOffline } from '../utils/offline.js';
import { renderPageShell } from '../components/pageShell.js';
import { renderPillGroup, handlePillGroupClick } from '../components/pillGroup.js';
import { renderHelperHint } from '../components/helperHint.js';
import { renderLoadingState } from '../components/resultPanel.js';

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

    if (!state.description && voice.niche) {
        state.niche = NICHES.find(n => n.label === voice.niche)?.id || 'general';
        state.tone = TONES.find(t => t.label === voice.tone)?.id || 'aesthetic';
    }

    renderPageShell(container, {
        title: 'Bio Generator',
        subtitle: 'Craft optimized, highly-converting Instagram bios using AI.',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
        renderMain: (mainEl) => {
            mainEl.innerHTML = `
                <div class="form-group">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">About You</label>
                    <div class="gen-textarea-wrapper">
                        <textarea class="gen-textarea" id="gen-description" placeholder="e.g. I'm a travel photographer who loves coffee and sunsets. Based in Bali.">${escapeHtml(state.description)}</textarea>
                        <div class="gen-textarea-footer-left">
                            ${renderHelperHint('Ctrl + Enter to generate')}
                        </div>
                        <div class="gen-textarea-footer">
                            <span class="char-count" id="gen-char-count">0/500</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Format</label>
                    <div id="format-chips">
                        ${renderPillGroup(FORMATS, state.format)}
                    </div>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Tone / Vibe</label>
                    <div id="tone-chips">
                        ${renderPillGroup(TONES.map(t => ({...t, icon: `<span style="width:8px;height:8px;border-radius:50%;background:${t.color};display:inline-block;"></span>`})), state.tone)}
                    </div>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Niche</label>
                    <div id="niche-chips">
                        ${renderPillGroup(NICHES, state.niche)}
                    </div>
                </div>

                <div class="mt-xl">
                    <button class="btn btn-primary" id="generate-btn" style="width:100%; padding: 16px; font-size:1.1rem; border-radius: 12px;">
                        <span class="btn-text">Generate Bios ✨</span>
                    </button>
                </div>
            `;
            // Re-mount results below main form card
            const shellRes = document.getElementById('shell-results-container');
            shellRes.innerHTML = `
                <div id="results-container"></div>
                <div style="display:flex; gap:24px; margin-top:32px; flex-wrap:wrap; margin-bottom: 40px;">
                    <div id="hashtags-container" style="flex:1; min-width:300px;"></div>
                    <div id="emojis-container" style="flex:1; min-width:300px;"></div>
                </div>
            `;
            bindEvents(container);
            updateCharCount(state.description.length);
        },
        renderRail: (railEl) => {
            railEl.innerHTML = `
                <div id="preview-container"></div>
                <div class="card" style="padding: 24px;">
                    <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 16px; display:flex; align-items:center; gap:8px;">💡 Pro Tips</h3>
                    <ul style="color:var(--text-secondary); font-size:0.85rem; padding-left:16px; display:flex; flex-direction:column; gap:12px; margin:0;">
                        <li><strong>Be specific:</strong> Instead of "I like food", try "Vegan baker obsessed with sourdough."</li>
                        <li><strong>Call to Action:</strong> Always choose the "With CTA" format if you want users to click your link.</li>
                        <li><strong>Vibe matching:</strong> Match your Tone to your target audience.</li>
                    </ul>
                </div>
                <div id="history-container"></div>
            `;
            renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio });
            renderHistory();
        }
    });

    if (state.bios.length > 0) {
        renderResults();
        if (state.hashtags.length > 0) renderHashtags();
        if (state.emojis.length > 0) renderEmojis();
    } else if (isOffline() && cached) {
        state.bios = cached.data.bios || [];
        state.selectedBio = state.bios[0] || '';
        if (state.bios.length) { renderResults(); renderPreview(document.getElementById('preview-container'), { bio: state.selectedBio }); }
    }
}

function bindEvents(container) {
    const descInput = document.getElementById('gen-description');

    descInput.addEventListener('input', (e) => {
        state.description = e.target.value;
        updateCharCount(e.target.value.length);
        debouncedPreviewUpdate(state.selectedBio);
    });

    document.getElementById('format-chips').addEventListener('click', e => handlePillGroupClick(e, state.format, v => state.format = v));
    document.getElementById('tone-chips').addEventListener('click', e => handlePillGroupClick(e, state.tone, v => state.tone = v));
    document.getElementById('niche-chips').addEventListener('click', e => handlePillGroupClick(e, state.niche, v => state.niche = v));

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

    document.getElementById('results-container').innerHTML = renderLoadingState();

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
    <div class="card" style="height: 100%;">
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
    <div class="card" style="height: 100%;">
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
