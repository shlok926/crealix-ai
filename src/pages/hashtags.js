// ==================== Smart Hashtags Page ====================
import { generateSmartHashtags } from '../services/ai.js';
import { getApiKey, saveHashtag, saveCaption, incrementUsage, checkUsageLimit, getBrandVoice } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml, escapeAttr } from '../utils/helpers.js';
import { cacheContent, getCachedContent, isOffline } from '../utils/offline.js';

const CONTENT_TYPES = [
    { id: 'post', label: 'Standard Post', emoji: '📸' },
    { id: 'reel', label: 'Instagram Reel', emoji: '🎬' },
    { id: 'carousel', label: 'Carousel', emoji: '🎠' }
];
const NICHES = [
    { id: 'general', label: 'General', emoji: '🌟' },
    { id: 'fitness', label: 'Fitness', emoji: '💪' },
    { id: 'travel', label: 'Travel', emoji: '✈️' },
    { id: 'food', label: 'Food', emoji: '🍕' },
    { id: 'tech', label: 'Tech', emoji: '💻' },
    { id: 'fashion', label: 'Fashion', emoji: '👗' },
    { id: 'art', label: 'Art', emoji: '🎨' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'business', label: 'Business', emoji: '📈' },
    { id: 'photography', label: 'Photography', emoji: '📸' }
];

let state = { content: '', type: 'post', niche: 'general', results: null, caption: '' };

export function renderHashtagsPage(container) {
    const voice = getBrandVoice();
    if (!state.content && voice.niche) {
        state.niche = NICHES.find(n => n.label === voice.niche)?.id || 'general';
    }
    const typeChips = CONTENT_TYPES.map(t =>
        `<button class="chip ${state.type === t.id ? 'selected' : ''}" data-type="${t.id}">
            <span class="chip-emoji">${t.emoji}</span> ${t.label}
        </button>`
    ).join('');
    const nicheChips = NICHES.map(n =>
        `<button class="chip ${state.niche === n.id ? 'selected' : ''}" data-niche="${n.id}">
            <span class="chip-emoji">${n.emoji}</span> ${n.label}
        </button>`
    ).join('');

    const cached = getCachedContent('hashtags');
    const offlineBanner = (isOffline() && cached) ? `
        <div class="offline-banner">
            📵 You're offline — showing cached results from ${new Date(cached.cachedAt).toLocaleTimeString()}
        </div>` : '';

    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">#️⃣ Smart Hashtags</h1>
        <p class="section-subtitle">AI-powered reach optimization</p>
        ${offlineBanner}
        <div class="card premium-card">
            <div class="form-group">
                <label class="form-label">Post Description</label>
                <textarea class="form-textarea premium-textarea" id="hash-desc" placeholder="What is your post about?" style="min-height:100px">${escapeHtml(state.content)}</textarea>
            </div>
            <div class="form-row mt-lg" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg)">
                <div class="form-group">
                    <label class="form-label">Content Type</label>
                    <div class="chip-group" id="hash-type-chips">${typeChips}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Niche</label>
                    <div class="chip-group" id="hash-niche-chips">${nicheChips}</div>
                </div>
            </div>
            <button class="btn btn-primary w-100 mt-xl glow-on-hover" id="hash-gen-btn" style="width:100%">
                <span class="btn-text">🚀 Generate Tags</span>
            </button>
        </div>
        <div id="hash-results"></div>
    </div>`;

    document.getElementById('hash-desc').oninput = e => { state.content = e.target.value; };
    document.getElementById('hash-type-chips').onclick = e => {
        const c = e.target.closest('.chip'); if (!c) return;
        state.type = c.dataset.type;
        container.querySelectorAll('#hash-type-chips .chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    };
    document.getElementById('hash-niche-chips').onclick = e => {
        const c = e.target.closest('.chip'); if (!c) return;
        state.niche = c.dataset.niche;
        container.querySelectorAll('#hash-niche-chips .chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    };
    document.getElementById('hash-gen-btn').onclick = handleGenerateHashtags;

    if (state.results) renderHashResults();
    else if (isOffline() && cached) { state.results = cached.data.groups; state.caption = cached.data.caption; renderHashResults(); }
}

async function handleGenerateHashtags() {
    if (!state.content.trim()) { showToast('Please enter a description!', 'error'); return; }
    if (!getApiKey()) { showToast('Set API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) { showToast('Daily limit reached (5/5). Come back tomorrow! 🚀', 'error'); return; }

    const btn = document.getElementById('hash-gen-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    document.getElementById('hash-results').innerHTML = `
        <div class="mt-xl"><h2 class="section-title" style="font-size:var(--fs-lg)">Analyzing...</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-top:var(--space-lg)">
            ${Array(4).fill('').map(() => `<div class="card skeleton-card"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line" style="width:70%"></div><div class="skeleton skeleton-line" style="width:50%"></div></div>`).join('')}
        </div></div>`;

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
        document.getElementById('hash-results').innerHTML = '';
    } finally {
        btn.classList.remove('btn-loading'); btn.disabled = false;
    }
}

function renderHashResults() {
    const c = document.getElementById('hash-results');
    if (!state.results) return;
    const cats = [
        { label: '🔥 High Reach', tags: state.results.high },
        { label: '🎯 Medium Reach', tags: state.results.medium },
        { label: '💎 Niche Specific', tags: state.results.niche },
        { label: '📈 Trending Style', tags: state.results.trending }
    ];
    const allTags = [...state.results.high, ...state.results.medium, ...state.results.niche, ...state.results.trending].join(' ');

    c.innerHTML = `
    <div class="mt-xl">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md)">
            <h2 class="section-title" style="font-size:var(--fs-lg);margin:0">Optimized Results</h2>
            <div style="display:flex;gap:var(--space-sm)">
                <button class="btn btn-sm btn-secondary" id="save-hash-set">💾 Save Set</button>
                <button class="btn btn-sm btn-primary" id="copy-all-hash">📋 Copy All</button>
            </div>
        </div>
        ${state.caption ? `
        <div class="card caption-result-card mb-lg" style="margin-bottom:var(--space-lg)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
                <h3 class="feature-title" style="margin:0">📝 Generated Caption</h3>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-sm btn-ghost" id="save-cap-btn">💾 Save</button>
                    <button class="btn btn-sm btn-ghost" id="copy-cap-btn">📋 Copy</button>
                </div>
            </div>
            <div class="caption-text">${escapeHtml(state.caption).replace(/\n/g, '<br>')}</div>
        </div>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg)">
            ${cats.map(cat => `
            <div class="card">
                <h3 class="feature-title" style="font-size:var(--fs-sm)">${cat.label}</h3>
                <div class="hashtag-pills mt-md">
                    ${cat.tags.map(t => `<span class="hashtag-pill" data-tag="${escapeAttr(t)}">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>`).join('')}
        </div>
    </div>`;

    c.querySelectorAll('.hashtag-pill').forEach(pill => pill.onclick = () => copyToClipboard(pill.dataset.tag));
    document.getElementById('copy-all-hash').onclick = () => copyToClipboard(allTags);
    const copyCapBtn = document.getElementById('copy-cap-btn');
    if (copyCapBtn) copyCapBtn.onclick = () => copyToClipboard(state.caption);
    const saveCapBtn = document.getElementById('save-cap-btn');
    if (saveCapBtn) saveCapBtn.onclick = () => { saveCaption(state.caption); showToast('Caption saved!', 'success'); };
    document.getElementById('save-hash-set').onclick = () => {
        saveHashtag(allTags, state.content.slice(0, 30) + '…');
        showToast('Hashtag set saved!', 'success');
    };
}
