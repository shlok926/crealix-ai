// ==================== Username Finder Page ====================
import { generateUsernames } from '../services/ai.js';
import { getApiKey } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml } from '../utils/helpers.js';
import { renderPageShell } from '../components/pageShell.js';
import { renderPillGroup, handlePillGroupClick } from '../components/pillGroup.js';
import { renderEmptyState, renderLoadingState } from '../components/resultPanel.js';
import { saveItemToCloud } from '../services/cloudStorage.js';
import { auth } from '../services/firebase.js';

const STYLES = [
    { id: 'aesthetic', label: 'Aesthetic', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>' },
    { id: 'cool', label: 'Cool', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    { id: 'og', label: 'OG', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M12 2v20"/></svg>' },
    { id: 'professional', label: 'Professional', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
    { id: 'cute', label: 'Cute', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
    { id: 'edgy', label: 'Edgy', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>' },
    { id: 'minimalist', label: 'Minimalist', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>' },
    { id: 'creative', label: 'Creative', iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' }
];

const COUNTS = [
    { id: '6', label: '6 Ideas' },
    { id: '12', label: '12 Ideas' },
    { id: '20', label: '20 Ideas' }
];

let state = {
    keywords: [],
    style: 'aesthetic',
    count: '6',
    usernames: []
};

export function renderUsername(container) {
    renderPageShell(container, {
        title: 'Username Finder',
        subtitle: 'Discover unique and memorable Instagram usernames.',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        renderMain: (mainEl) => {
            mainEl.innerHTML = `
                <div class="form-group">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">
                        Keywords
                        <span class="form-label-sub" style="font-weight:normal; color:var(--text-tertiary); font-family:'Inter', sans-serif;"> (Type and press Enter)</span>
                    </label>
                    <div style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:12px; padding:12px 16px; min-height:56px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                        <div id="keyword-chips-container" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
                        <input type="text" id="username-keyword-input" placeholder="e.g. photography..." style="background:transparent; border:none; outline:none; color:var(--text-primary); font-size:1rem; flex:1; min-width:120px;" />
                    </div>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Username Style</label>
                    <div id="style-chips">
                        ${renderPillGroup(STYLES, state.style)}
                    </div>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Results Count</label>
                    <div id="count-chips">
                        ${renderPillGroup(COUNTS, state.count)}
                    </div>
                </div>

                <div class="mt-xl">
                    <button class="btn btn-primary" id="find-btn" style="width:100%; padding: 16px; font-size:1.1rem; border-radius: 12px;">
                        <span class="btn-text">Find Usernames 🔍</span>
                    </button>
                </div>
            `;

            // Setup Keyword Chips
            const kwInput = mainEl.querySelector('#username-keyword-input');
            const kwContainer = mainEl.querySelector('#keyword-chips-container');

            const renderKwChips = () => {
                kwContainer.innerHTML = state.keywords.map((kw, i) => `
                    <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:16px; padding:4px 12px; display:flex; align-items:center; gap:6px; font-size:0.9rem;">
                        <span>${escapeHtml(kw)}</span>
                        <button class="btn-icon" data-index="${i}" style="width:16px; height:16px; padding:0; display:flex; align-items:center; justify-content:center; opacity:0.6;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                `).join('');

                kwContainer.querySelectorAll('.btn-icon').forEach(btn => {
                    btn.onclick = (e) => {
                        const idx = parseInt(e.currentTarget.dataset.index);
                        state.keywords.splice(idx, 1);
                        renderKwChips();
                    };
                });
            };
            renderKwChips();

            kwInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = kwInput.value.trim().replace(',', '');
                    if (val && !state.keywords.includes(val)) {
                        state.keywords.push(val);
                        kwInput.value = '';
                        renderKwChips();
                    }
                } else if (e.key === 'Backspace' && kwInput.value === '' && state.keywords.length > 0) {
                    state.keywords.pop();
                    renderKwChips();
                }
            });

            // Bind pills
            mainEl.querySelector('#style-chips').addEventListener('click', e => handlePillGroupClick(e, state.style, v => state.style = v));
            mainEl.querySelector('#count-chips').addEventListener('click', e => handlePillGroupClick(e, state.count, v => state.count = v));

            // Generate Button
            mainEl.querySelector('#find-btn').onclick = () => handleFind(mainEl);
        },
        renderRail: (railEl) => {
            railEl.innerHTML = renderEmptyState('usernames');
        }
    });
}

async function handleFind(mainEl) {
    if (state.keywords.length === 0) {
        showToast('Please add at least one keyword!', 'error');
        return;
    }

    if (!getApiKey()) {
        showToast('Please set your API key first', 'error');
        openSettingsModal();
        return;
    }

    const btn = mainEl.querySelector('#find-btn');
    const railEl = document.getElementById('shell-rail-content');

    btn.classList.add('btn-loading');
    btn.disabled = true;
    railEl.innerHTML = renderLoadingState();

    try {
        const styleName = STYLES.find(s => s.id === state.style)?.label || state.style;
        const countNum = parseInt(state.count) || 6;
        const keywordsStr = state.keywords.join(', ');
        
        state.usernames = await generateUsernames(keywordsStr, styleName, countNum);
        renderResults(railEl);
    } catch (err) {
        if (err.message === 'API_KEY_MISSING') {
            showToast('Please set your API key in Settings', 'error');
            openSettingsModal();
        } else if (err.message === 'INVALID_API_KEY') {
            showToast('Invalid API key. Please check Settings', 'error');
        } else {
            showToast('Generation failed. Please try again.', 'error');
        }
        railEl.innerHTML = renderEmptyState('usernames');
    } finally {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}

function renderResults(railEl) {
    if (!state.usernames.length) {
        railEl.innerHTML = renderEmptyState('usernames');
        return;
    }

    const listHtml = state.usernames.map((u, i) => `
        <div class="card" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; animation-delay:${i * 0.05}s">
            <div>
                <div style="font-weight:700; font-size:1.1rem; color:var(--text-primary); font-family:'Space Grotesk', sans-serif;">@${escapeHtml(u)}</div>
                <a href="https://instagram.com/${encodeURIComponent(u)}" target="_blank" style="font-size:0.8rem; color:var(--primary-color); text-decoration:none; display:flex; align-items:center; gap:4px; margin-top:4px;">
                    Check on Instagram
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn-icon" data-action="copy" data-username="${escapeHtml(u)}" title="Copy"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                <button class="btn-icon" data-action="save" data-username="${escapeHtml(u)}" title="Save"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></button>
            </div>
        </div>
    `).join('');

    railEl.innerHTML = `
        <div class="animate-in" style="padding-bottom:24px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.2rem; margin-bottom: 24px;">Generated Usernames</h3>
            ${listHtml}
            <p style="text-align:center; font-size:0.8rem; color:var(--text-tertiary); margin-top:24px; font-style:italic;">
                Note: AI generates these ideas, but availability on Instagram is not guaranteed. Please check manually.
            </p>
        </div>
    `;

    railEl.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = async () => {
            const username = btn.dataset.username;
            if (btn.dataset.action === 'copy') {
                copyToClipboard(`@${username}`);
                showToast('Username copied!', 'success');
            } else if (btn.dataset.action === 'save') {
                if (!auth.currentUser) return showToast('Please login to save to cloud', 'info');
                try {
                    await saveItemToCloud(auth.currentUser.uid, 'usernames', { username: `@${username}`, style: state.style });
                    showToast('Saved to Library!', 'success');
                } catch (e) {
                    showToast('Failed to save', 'error');
                }
            }
        };
    });
}
