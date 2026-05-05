// ==================== Username Finder Page ====================
import { generateUsernames } from '../services/ai.js';
import { getApiKey, saveUsername } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';

const STYLES = [
    { id: 'aesthetic', label: 'Aesthetic', emoji: '🌸' },
    { id: 'cool', label: 'Cool', emoji: '😎' },
    { id: 'og', label: 'OG', emoji: '👑' },
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'cute', label: 'Cute', emoji: '🧸' },
    { id: 'edgy', label: 'Edgy', emoji: '⚡' },
    { id: 'minimalist', label: 'Minimalist', emoji: '✦' },
    { id: 'creative', label: 'Creative', emoji: '🎨' }
];

let state = {
    keywords: '',
    style: 'aesthetic',
    usernames: [],
    loading: false
};

export function renderUsername(container) {
    container.innerHTML = `
    <div class="page page-narrow">
      <h1 class="section-title">🔍 Username Finder</h1>
      <p class="section-subtitle">Discover unique and memorable Instagram usernames</p>

      <div class="card">
        <div class="form-group">
          <label class="form-label">
            Keywords
            <span class="form-label-sub"> — Your name, brand, or words that define you</span>
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="username-keywords" 
            placeholder="e.g. Sarah, photography, wanderlust"
            value="${state.keywords}"
            maxlength="200"
          />
        </div>

        <div class="form-group mt-lg">
          <label class="form-label">Username Style</label>
          <div class="chip-group" id="style-chips">
            ${STYLES.map(s => `
              <button class="chip ${state.style === s.id ? 'selected' : ''}" data-style="${s.id}">
                <span class="chip-emoji">${s.emoji}</span> ${s.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="mt-xl">
          <button class="btn btn-primary" id="find-btn" style="width:100%">
            <span class="btn-text">🔍 Find Usernames</span>
          </button>
        </div>
      </div>

      <div id="username-results"></div>
    </div>
  `;

    bindUsernameEvents();

    if (state.usernames.length > 0) {
        renderUsernameResults();
    }
}

function bindUsernameEvents() {
    const input = document.getElementById('username-keywords');
    input.addEventListener('input', (e) => { state.keywords = e.target.value; });

    document.getElementById('style-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        state.style = chip.dataset.style;
        document.querySelectorAll('#style-chips .chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
    });

    document.getElementById('find-btn').addEventListener('click', handleFind);
}

async function handleFind() {
    if (!state.keywords.trim()) {
        showToast('Please enter some keywords first!', 'error');
        return;
    }

    if (!getApiKey()) {
        showToast('Please set your API key first', 'error');
        openSettingsModal();
        return;
    }

    const btn = document.getElementById('find-btn');
    btn.classList.add('btn-loading');
    btn.disabled = true;
    state.loading = true;

    const resultsContainer = document.getElementById('username-results');
    resultsContainer.innerHTML = `
    <div class="mt-xl">
      <h2 class="section-title" style="font-size:var(--fs-lg)">Finding usernames...</h2>
      <div class="username-grid mt-md">
        ${Array(6).fill('').map(() => `
          <div class="card skeleton-card"><div class="skeleton skeleton-line" style="width:70%"></div></div>
        `).join('')}
      </div>
    </div>
  `;

    try {
        const styleName = STYLES.find(s => s.id === state.style)?.label || state.style;
        state.usernames = await generateUsernames(state.keywords, styleName);
        renderUsernameResults();
    } catch (err) {
        if (err.message === 'API_KEY_MISSING') {
            showToast('Please set your API key in Settings', 'error');
            openSettingsModal();
        } else if (err.message === 'INVALID_API_KEY') {
            showToast('Invalid API key. Please check Settings', 'error');
        } else {
            showToast('Generation failed. Please try again.', 'error');
            console.error(err);
        }
        resultsContainer.innerHTML = '';
    } finally {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        state.loading = false;
    }
}

function renderUsernameResults() {
    const container = document.getElementById('username-results');
    if (!state.usernames.length) return;

    container.innerHTML = `
    <div class="mt-xl">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md)">
        <h2 class="section-title" style="font-size:var(--fs-lg);margin-bottom:0">Username Suggestions</h2>
        <button class="btn btn-sm btn-secondary" id="regen-usernames">🔄 Shuffle</button>
      </div>
      <div class="username-grid">
        ${state.usernames.map((u, i) => `
          <div class="card username-card" style="animation-delay:${i * 0.05}s">
            <div>
              <span class="username-at">@</span>
              <span class="username-text">${escapeHtml(u)}</span>
            </div>
            <div class="result-actions">
              <button class="btn-icon" data-action="copy" data-username="${escapeHtml(u)}" title="Copy">📋</button>
              <button class="btn-icon" data-action="save" data-username="${escapeHtml(u)}" title="Save">💾</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

    document.getElementById('regen-usernames').addEventListener('click', handleFind);

    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.dataset.username;
            if (btn.dataset.action === 'copy') {
                copyToClipboard(`@${username}`);
            } else if (btn.dataset.action === 'save') {
                saveUsername(username);
                showToast('Username saved to favorites!', 'success');
            }
        });
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
