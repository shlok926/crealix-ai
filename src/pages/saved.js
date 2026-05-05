import { 
    getSavedBios, removeBio, 
    getSavedUsernames, removeUsername, 
    getSavedHashtags, removeHashtag, 
    getSavedCaptions, removeCaption,
    getSavedScripts, removeScript,
    getSavedStories, removeStoryIdea
} from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { escapeHtml, formatRelative } from '../utils/helpers.js';

const TABS = [
    { id: 'bios', label: 'Bios' },
    { id: 'usernames', label: 'Usernames' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'captions', label: 'Captions' },
    { id: 'scripts', label: 'Scripts' },
    { id: 'stories', label: 'Stories' }
];

let activeTab = 'bios';

export function renderSaved(container) {
    const tabsHtml = TABS.map(t =>
        `<button class="tab-btn ${activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`
    ).join('');

    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">Saved Content</h1>
        <p class="section-subtitle">Your saved bios, usernames, hashtags & captions</p>
        <div class="saved-tabs-container">
            <div class="saved-tabs" id="saved-tabs">${tabsHtml}</div>
        </div>
        <div id="saved-content"></div>
    </div>`;

    document.getElementById('saved-tabs').onclick = e => {
        const btn = e.target.closest('[data-tab]'); if (!btn) return;
        activeTab = btn.dataset.tab;
        renderSaved(container);
    };

    renderActiveTab();
}

function renderActiveTab() {
    const c = document.getElementById('saved-content');

    if (activeTab === 'bios') {
        const items = getSavedBios();
        if (!items.length) { c.innerHTML = emptyState('No Bios Saved Yet', 'Generate bios and save them here.', '#/generator', 'Generate Bios'); return; }
        c.innerHTML = `<div class="results-grid mt-lg">
            ${items.map(item => `
            <div class="card result-card" data-id="${item.id}">
                <div class="result-bio">${escapeHtml(item.text)}</div>
                <div class="result-meta">
                    <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${formatRelative(item.savedAt)}</span>
                    <div class="result-actions">
                        <button class="btn-icon" data-action="copy" data-text="${escapeAttr(item.text)}" title="Copy">📋</button>
                        <button class="btn-icon" data-action="delete" data-id="${item.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>`).join('')}
        </div>`;
        bindActions(c, () => renderSaved(document.querySelector('[id="page-content"]') || c.closest('.page-narrow')?.parentElement || document.getElementById('page-content')));
    }

    else if (activeTab === 'usernames') {
        const items = getSavedUsernames();
        if (!items.length) { c.innerHTML = emptyState('No Usernames Saved', 'Find usernames and save your favorites.', '#/username', 'Find Usernames'); return; }
        c.innerHTML = `<div class="username-grid mt-lg">
            ${items.map(item => `
            <div class="card username-card" data-id="${item.id}" style="display:flex;align-items:center;justify-content:space-between">
                <div><span style="color:var(--text-tertiary)">@</span><span style="font-weight:700">${escapeHtml(item.text)}</span></div>
                <div class="result-actions">
                    <button class="btn-icon" data-action="copy" data-text="@${escapeAttr(item.text)}" title="Copy">📋</button>
                    <button class="btn-icon" data-action="delete-un" data-id="${item.id}" title="Delete">🗑️</button>
                </div>
            </div>`).join('')}
        </div>`;
        c.querySelectorAll('[data-action="copy"]').forEach(btn => btn.onclick = () => copyToClipboard(btn.dataset.text));
        c.querySelectorAll('[data-action="delete-un"]').forEach(btn => btn.onclick = () => {
            removeUsername(btn.dataset.id);
            showToast('Removed', 'info');
            btn.closest('.card')?.remove();
            if (!getSavedUsernames().length) renderSaved(document.getElementById('page-content') || c);
        });
    }

    else if (activeTab === 'hashtags') {
        const items = getSavedHashtags();
        if (!items.length) { c.innerHTML = emptyState('No Hashtag Sets Saved', 'Generate smart hashtags and save your sets.', '#/smart-hashtags', 'Generate Hashtags'); return; }
        c.innerHTML = `<div class="results-grid mt-lg">
            ${items.map(item => `
            <div class="card" data-id="${item.id}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
                    <span style="font-size:var(--fs-sm);font-weight:600">${escapeHtml(item.name || 'Hashtag Set')}</span>
                    <div style="display:flex;gap:6px">
                        <button class="btn btn-sm btn-ghost" data-action="copy" data-text="${escapeAttr(item.tags)}" title="Copy">📋</button>
                        <button class="btn-icon" style="width:32px;height:32px" data-action="delete-ht" data-id="${item.id}" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="hashtag-pills">${item.tags.split(' ').slice(0, 10).map(t => `<span class="hashtag-pill">${escapeHtml(t)}</span>`).join('')}</div>
                <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${formatRelative(item.savedAt)}</span>
            </div>`).join('')}
        </div>`;
        c.querySelectorAll('[data-action="copy"]').forEach(btn => btn.onclick = () => copyToClipboard(btn.dataset.text));
        c.querySelectorAll('[data-action="delete-ht"]').forEach(btn => btn.onclick = () => {
            removeHashtag(btn.dataset.id); showToast('Removed', 'info'); btn.closest('.card')?.remove();
        });
    }

    else if (activeTab === 'captions') {
        const items = getSavedCaptions();
        if (!items.length) { c.innerHTML = emptyState('No Captions Saved', 'Create stunning captions in Caption Studio.', '#/captions', 'Create Captions'); return; }
        c.innerHTML = `<div class="results-grid mt-lg">
            ${items.map(item => `
            <div class="card result-card" data-id="${item.id}">
                <div class="result-bio" style="white-space:pre-wrap">${escapeHtml(item.text)}</div>
                <div class="result-meta">
                    <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${formatRelative(item.savedAt)}</span>
                    <div class="result-actions">
                        <button class="btn-icon" data-action="copy" data-text="${escapeAttr(item.text)}" title="Copy">📋</button>
                        <button class="btn-icon" data-action="delete-cap" data-id="${item.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>`).join('')}
        </div>`;
        c.querySelectorAll('[data-action="copy"]').forEach(btn => btn.onclick = () => copyToClipboard(btn.dataset.text));
        c.querySelectorAll('[data-action="delete-cap"]').forEach(btn => btn.onclick = () => {
            removeCaption(btn.dataset.id); showToast('Removed', 'info'); btn.closest('.card')?.remove();
            if (!getSavedCaptions().length) renderSaved(document.getElementById('page-content') || c);
        });
    }

    else if (activeTab === 'scripts') {
        const items = getSavedScripts();
        if (!items.length) { c.innerHTML = emptyState('No Scripts Saved', 'Generate Reel scripts and save your favorites.', '#/reel-script', 'Create Scripts'); return; }
        c.innerHTML = `<div class="results-grid mt-lg">
            ${items.map(item => `
            <div class="card result-card" data-id="${item.id}">
                <div style="font-weight:700; margin-bottom:8px">🪝 ${escapeHtml(item.hook.slice(0, 50))}...</div>
                <div class="result-bio" style="font-size:13px; color:var(--text-secondary)">${escapeHtml(item.scenes[0].audio.slice(0, 100))}...</div>
                <div class="result-meta">
                    <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${formatRelative(item.savedAt)}</span>
                    <div class="result-actions">
                        <button class="btn-icon" data-action="delete-script" data-id="${item.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>`).join('')}
        </div>`;
        c.querySelectorAll('[data-action="delete-script"]').forEach(btn => btn.onclick = () => {
            removeScript(btn.dataset.id); showToast('Removed', 'info'); btn.closest('.card')?.remove();
        });
    }

    else if (activeTab === 'stories') {
        const items = getSavedStories();
        if (!items.length) { c.innerHTML = emptyState('No Story Ideas Saved', 'Generate story ideas and save them here.', '#/story-ideas', 'Get Ideas'); return; }
        c.innerHTML = `<div class="results-grid mt-lg">
            ${items.map(item => `
            <div class="card result-card" data-id="${item.id}">
                <div style="font-weight:700; margin-bottom:4px">${escapeHtml(item.title)}</div>
                <div style="font-size:13px; color:var(--text-secondary); white-space:pre-wrap">${escapeHtml(item.content)}</div>
                <div class="result-meta">
                    <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${formatRelative(item.savedAt)}</span>
                    <div class="result-actions">
                        <button class="btn-icon" data-action="delete-story" data-id="${item.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>`).join('')}
        </div>`;
        c.querySelectorAll('[data-action="delete-story"]').forEach(btn => btn.onclick = () => {
            removeStoryIdea(btn.dataset.id); showToast('Removed', 'info'); btn.closest('.card')?.remove();
        });
    }
}

function bindActions(container, onDelete) {
    container.querySelectorAll('[data-action="copy"]').forEach(btn => btn.onclick = () => copyToClipboard(btn.dataset.text));
    container.querySelectorAll('[data-action="delete"]').forEach(btn => btn.onclick = () => {
        removeBio(btn.dataset.id); showToast('Bio removed', 'info'); btn.closest('.card')?.remove();
        if (!getSavedBios().length) onDelete?.();
    });
}

// ── Empty State ──────────────────────────────────────────────
function emptyState(title, desc, href, cta) {
    return `
    <div class="empty-state mt-xl">
        <h3 class="empty-state-title" style="margin-top:16px">${title}</h3>
        <p class="empty-state-desc">${desc}</p>
        <a href="${href}" class="btn btn-primary mt-lg">${cta}</a>
    </div>`;
}

function escapeAttr(s) {
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, ' ');
}
