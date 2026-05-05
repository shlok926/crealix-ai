// ==================== Caption Studio Page ====================
import { generateCaption, improveCaption } from '../services/ai.js';
import { getApiKey, saveCaption, incrementUsage, checkUsageLimit, getBrandVoice } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml } from '../utils/helpers.js';
import { cacheContent, getCachedContent, isOffline } from '../utils/offline.js';

const CONTENT_TYPES = [
    { id: 'post', label: 'Standard Post', emoji: '📸' },
    { id: 'reel', label: 'Reel', emoji: '🎬' },
    { id: 'carousel', label: 'Carousel', emoji: '🎠' }
];
const TONES = [
    { id: 'aesthetic', label: 'Aesthetic', emoji: '🌸' },
    { id: 'funny', label: 'Funny', emoji: '😂' },
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'motivational', label: 'Motivational', emoji: '🔥' },
    { id: 'casual', label: 'Casual', emoji: '😊' }
];
const GOALS = [
    { id: 'engagement', label: 'Engagement' },
    { id: 'followers', label: 'Followers' },
    { id: 'sales', label: 'Sales' },
    { id: 'awareness', label: 'Awareness' }
];

let state = {
    mode: 'generate', // 'generate' | 'improve'
    content: '', type: 'post', tone: 'aesthetic', audience: '', goal: 'engagement',
    originalCaption: '',
    results: null, analysis: null
};

export function renderCaptionsPage(container) {
    const cached = getCachedContent('captions');
    const voice = getBrandVoice();
    
    // Pre-fill state from brand voice if state is empty
    if (!state.content && !state.audience && voice.niche) {
        state.tone = TONES.find(t => t.label === voice.tone)?.id || 'aesthetic';
        state.audience = `people interested in ${voice.niche}`;
    }
    
    const offlineBanner = (isOffline() && cached) ? `<div class="offline-banner">📵 Offline — showing cached results</div>` : '';

    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">✍️ Caption Studio</h1>
        <p class="section-subtitle">Generate scroll-stopping Instagram captions</p>
        ${offlineBanner}
        <div class="mode-toggle" style="margin-bottom:var(--space-lg)">
            <button class="mode-btn ${state.mode === 'generate' ? 'active' : ''}" data-mode="generate">✨ Generate New</button>
            <button class="mode-btn ${state.mode === 'improve' ? 'active' : ''}" data-mode="improve">🔧 Improve Existing</button>
        </div>

        <div class="card premium-card" id="caption-form">
            ${state.mode === 'generate' ? renderGenerateForm() : renderImproveForm()}
            <button class="btn btn-primary glow-on-hover mt-xl" id="caption-btn" style="width:100%">
                <span class="btn-text">${state.mode === 'generate' ? '✨ Generate Caption' : '🔧 Improve Caption'}</span>
            </button>
        </div>
        <div id="caption-results"></div>
    </div>`;

    // Mode toggle
    container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => {
            state.mode = btn.dataset.mode;
            renderCaptionsPage(container);
        };
    });

    // Form bindings
    if (state.mode === 'generate') {
        document.getElementById('cap-content').oninput = e => { state.content = e.target.value; };
        document.getElementById('cap-audience').oninput = e => { state.audience = e.target.value; };
        container.querySelectorAll('#cap-type-chips .chip').forEach(c =>
            c.onclick = () => { state.type = c.dataset.type; container.querySelectorAll('#cap-type-chips .chip').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); }
        );
        container.querySelectorAll('#cap-tone-chips .chip').forEach(c =>
            c.onclick = () => { state.tone = c.dataset.tone; container.querySelectorAll('#cap-tone-chips .chip').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); }
        );
        document.getElementById('cap-goal').onchange = e => { state.goal = e.target.value; };
    } else {
        document.getElementById('cap-original').oninput = e => { state.originalCaption = e.target.value; };
        container.querySelectorAll('#imp-tone-chips .chip').forEach(c =>
            c.onclick = () => { state.tone = c.dataset.tone; container.querySelectorAll('#imp-tone-chips .chip').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); }
        );
        document.getElementById('imp-goal').onchange = e => { state.goal = e.target.value; };
    }

    document.getElementById('caption-btn').onclick = handleCaption;

    if (state.results) renderCaptionResults();
    else if (isOffline() && cached) { state.results = cached.data; renderCaptionResults(); }
}

function renderGenerateForm() {
    const typeChips = CONTENT_TYPES.map(t =>
        `<button class="chip ${state.type === t.id ? 'selected' : ''}" data-type="${t.id}"><span class="chip-emoji">${t.emoji}</span> ${t.label}</button>`
    ).join('');
    const toneChips = TONES.map(t =>
        `<button class="chip ${state.tone === t.id ? 'selected' : ''}" data-tone="${t.id}"><span class="chip-emoji">${t.emoji}</span> ${t.label}</button>`
    ).join('');
    return `
        <div class="form-group">
            <label class="form-label">Post Description</label>
            <textarea class="form-textarea premium-textarea" id="cap-content" placeholder="What is your post about?" style="min-height:100px">${escapeHtml(state.content)}</textarea>
        </div>
        <div class="form-group mt-lg">
            <label class="form-label">Content Type</label>
            <div class="chip-group" id="cap-type-chips">${typeChips}</div>
        </div>
        <div class="form-group mt-lg">
            <label class="form-label">Tone</label>
            <div class="chip-group" id="cap-tone-chips">${toneChips}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-top:var(--space-lg)">
            <div class="form-group">
                <label class="form-label">Target Audience <span class="label-optional">(optional)</span></label>
                <input type="text" class="form-input premium-input" id="cap-audience" placeholder="e.g. small business owners" value="${escapeHtml(state.audience)}">
            </div>
            <div class="form-group">
                <label class="form-label">Goal</label>
                <select class="form-input" id="cap-goal">
                    ${GOALS.map(g => `<option value="${g.id}" ${state.goal === g.id ? 'selected' : ''}>${g.label}</option>`).join('')}
                </select>
            </div>
        </div>`;
}

function renderImproveForm() {
    const toneChips = TONES.map(t =>
        `<button class="chip ${state.tone === t.id ? 'selected' : ''}" data-tone="${t.id}"><span class="chip-emoji">${t.emoji}</span> ${t.label}</button>`
    ).join('');
    return `
        <div class="form-group">
            <label class="form-label">Your Existing Caption</label>
            <textarea class="form-textarea premium-textarea" id="cap-original" placeholder="Paste your existing Instagram caption here..." style="min-height:120px">${escapeHtml(state.originalCaption)}</textarea>
        </div>
        <div class="form-group mt-lg">
            <label class="form-label">Desired Tone</label>
            <div class="chip-group" id="imp-tone-chips">${toneChips}</div>
        </div>
        <div class="form-group mt-lg">
            <label class="form-label">Optimization Goal</label>
            <select class="form-input" id="imp-goal">
                ${GOALS.map(g => `<option value="${g.id}" ${state.goal === g.id ? 'selected' : ''}>${g.label}</option>`).join('')}
            </select>
        </div>`;
}

async function handleCaption() {
    const input = state.mode === 'generate' ? state.content : state.originalCaption;
    if (!input.trim()) { showToast(`Please ${state.mode === 'generate' ? 'describe your post' : 'paste your caption'}!`, 'error'); return; }
    if (!getApiKey()) { showToast('Set API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) { showToast('Daily limit reached. Come back tomorrow!', 'error'); return; }

    const btn = document.getElementById('caption-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    document.getElementById('caption-results').innerHTML = `
        <div class="card mt-xl">
            <div class="skeleton skeleton-line" style="width:50%"></div>
            <div class="skeleton skeleton-line mt-md"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line" style="width:70%"></div>
        </div>`;
    try {
        const voice = getBrandVoice();
        if (state.mode === 'generate') {
            const typeName = CONTENT_TYPES.find(t => t.id === state.type)?.label || state.type;
            const toneName = TONES.find(t => t.id === state.tone)?.label || state.tone;
            const context = voice.name ? `${state.content} (Brand Name: ${voice.name})` : state.content;
            state.results = await generateCaption(context, typeName, toneName, state.audience, state.goal);
        } else {
            const toneName = TONES.find(t => t.id === state.tone)?.label || state.tone;
            const context = voice.name ? `${state.originalCaption} (Brand Name: ${voice.name})` : state.originalCaption;
            state.results = await improveCaption(context, toneName, state.goal);
        }
        incrementUsage();
        cacheContent('captions', state.results);
        renderCaptionResults();
    } catch (err) {
        showToast('Generation failed. Try again.', 'error');
        document.getElementById('caption-results').innerHTML = '';
    } finally {
        btn.classList.remove('btn-loading'); btn.disabled = false;
    }
}

function renderCaptionResults() {
    const c = document.getElementById('caption-results');
    const r = state.results;
    if (!r) return;

    if (state.mode === 'improve') {
        c.innerHTML = `
        <div class="card premium-result mt-xl animate-in">
            <div class="result-header">
                <h2 class="section-title" style="font-size:var(--fs-lg);margin:0">Improved Caption</h2>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-sm btn-ghost" id="save-imp-cap">💾 Save</button>
                    <button class="btn btn-sm btn-primary" id="copy-imp-cap">📋 Copy</button>
                </div>
            </div>
            <p style="color:var(--text-primary);line-height:1.7;white-space:pre-line">${escapeHtml(r.improved || '')}</p>
            ${r.changes?.length ? `
            <div class="mt-xl">
                <h3 class="feature-title" style="margin-bottom:var(--space-md)">📝 What Changed</h3>
                <ul class="suggestion-list">${r.changes.map(ch => `<li>${escapeHtml(ch)}</li>`).join('')}</ul>
            </div>` : ''}
        </div>`;
        document.getElementById('copy-imp-cap').onclick = () => copyToClipboard(r.improved || '');
        document.getElementById('save-imp-cap').onclick = () => { saveCaption(r.improved || ''); showToast('Caption saved!', 'success'); };
        return;
    }

    const fullCaption = [r.hook, r.body, r.cta, (r.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
    c.innerHTML = `
    <div class="card premium-result mt-xl animate-in">
        <div class="result-header">
            <h2 class="section-title" style="font-size:var(--fs-lg);margin:0">Your Caption</h2>
            <div style="display:flex;gap:8px">
                <button class="btn btn-sm btn-ghost" id="save-cap">💾 Save</button>
                <button class="btn btn-sm btn-primary" id="copy-cap">📋 Copy All</button>
            </div>
        </div>
        <div class="caption-sections">
            ${r.hook ? `<div><div class="section-label-row"><span class="section-tag tag-purple">HOOK</span></div><p class="section-content hook-text">${escapeHtml(r.hook)}</p></div>` : ''}
            ${r.body ? `<div><div class="section-label-row"><span class="section-tag tag-blue">BODY</span></div><p class="section-content">${escapeHtml(r.body)}</p></div>` : ''}
            ${r.cta ? `<div><div class="section-label-row"><span class="section-tag tag-pink">CALL TO ACTION</span></div><p class="section-content cta-text">${escapeHtml(r.cta)}</p></div>` : ''}
            ${r.hashtags?.length ? `
            <div>
                <div class="section-label-row"><span class="section-tag tag-purple">HASHTAGS</span></div>
                <div class="hashtag-pills mt-sm">
                    ${r.hashtags.map(t => `<span class="hashtag-pill" onclick="navigator.clipboard?.writeText?.('${t}')">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>` : ''}
        </div>
    </div>`;

    document.getElementById('copy-cap').onclick = () => copyToClipboard(fullCaption);
    document.getElementById('save-cap').onclick = () => { saveCaption(fullCaption); showToast('Caption saved!', 'success'); };
}
