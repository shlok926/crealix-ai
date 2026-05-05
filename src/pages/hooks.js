// ==================== Hook Generator Page ====================
import { generateHooks } from '../services/ai.js';
import { getApiKey, incrementUsage, checkUsageLimit } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml } from '../utils/helpers.js';

const TONES = ['Professional','Casual','Witty','Inspiring','Bold','Playful'];

let state = { topic: '', audience: '', tone: 'Professional', results: [] };

export function renderHooksPage(container) {
    const toneChips = TONES.map(t =>
        `<button class="chip ${state.tone === t ? 'selected' : ''}" data-tone="${t}">${t}</button>`
    ).join('');

    const emptyState = `
    <div class="empty-state">
        <div class="empty-state-icon">🪝</div>
        <h3 class="empty-state-title">No Hooks Generated Yet</h3>
        <p class="empty-state-desc">Describe your topic and generate 5 powerful attention-grabbing hooks to stop the scroll.</p>
    </div>`;

    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">🪝 Hook Generator</h1>
        <p class="section-subtitle">Stop the scroll with powerful opening lines</p>
        <div class="card">
            <div class="form-group">
                <label class="form-label">Topic / Content<span class="form-label-sub"> — What is your post or reel about?</span></label>
                <input type="text" class="form-input" id="hook-topic" placeholder="e.g. Morning routines that changed my life" value="${escapeHtml(state.topic)}">
            </div>
            <div class="form-group mt-lg">
                <label class="form-label">Target Audience<span class="form-label-sub"> — Who are you speaking to?</span></label>
                <input type="text" class="form-input" id="hook-audience" placeholder="e.g. Entrepreneurs, fitness lovers, students" value="${escapeHtml(state.audience)}">
            </div>
            <div class="form-group mt-lg">
                <label class="form-label">Tone</label>
                <div class="chip-group" id="hook-tone-chips">${toneChips}</div>
            </div>
            <button class="btn btn-primary mt-xl" id="hook-btn" style="width:100%">
                <span class="btn-text">🪝 Generate Hooks</span>
            </button>
        </div>
        <div id="hook-results">${state.results.length === 0 ? emptyState : ''}</div>
    </div>`;

    document.getElementById('hook-topic').oninput = e => { state.topic = e.target.value; };
    document.getElementById('hook-audience').oninput = e => { state.audience = e.target.value; };
    document.getElementById('hook-tone-chips').onclick = e => {
        const c = e.target.closest('.chip'); if (!c) return;
        state.tone = c.dataset.tone;
        container.querySelectorAll('#hook-tone-chips .chip').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
    };
    document.getElementById('hook-btn').onclick = handleGenerateHooks;
    if (state.results.length > 0) renderHookResults();
}

async function handleGenerateHooks() {
    if (!state.topic.trim()) { showToast('Please enter your topic!', 'error'); return; }
    if (!getApiKey()) { showToast('Set API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) { showToast('Daily limit reached. Come back tomorrow!', 'error'); return; }

    const btn = document.getElementById('hook-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    document.getElementById('hook-results').innerHTML = `
        <div class="mt-xl">${[1,2,3,4,5].map(() => `
        <div class="card skeleton-card mt-md">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line" style="width:70%"></div>
        </div>`).join('')}</div>`;

    try {
        state.results = await generateHooks(state.topic, state.audience || 'General audience', state.tone);
        incrementUsage();
        renderHookResults();
    } catch (err) {
        showToast('Generation failed. Try again.', 'error');
        document.getElementById('hook-results').innerHTML = '';
    } finally {
        btn.classList.remove('btn-loading'); btn.disabled = false;
    }
}

function renderHookResults() {
    const c = document.getElementById('hook-results');
    if (!state.results.length) return;
    c.innerHTML = `
    <div class="mt-xl">
        <h2 class="section-title" style="font-size:var(--fs-lg)">Your Hooks</h2>
        <div class="results-grid">
            ${state.results.map((hook, i) => `
            <div class="card result-card animate-in" style="animation-delay:${i * 0.08}s">
                <div class="hook-number">${i + 1}</div>
                <p class="hook-text" style="margin:var(--space-sm) 0;font-size:var(--fs-md);line-height:1.5">${escapeHtml(hook)}</p>
                <div class="result-actions" style="margin-top:var(--space-md)">
                    <button class="btn btn-sm btn-secondary" data-copy="${escapeAttr(hook)}">📋 Copy</button>
                </div>
            </div>`).join('')}
        </div>
    </div>`;
    c.querySelectorAll('[data-copy]').forEach(btn => btn.onclick = () => copyToClipboard(btn.dataset.copy));
}

function escapeAttr(s) { return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
