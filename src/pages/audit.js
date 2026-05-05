// ==================== Profile Audit 2.0 Page ====================
import { generateDeepProfileAudit } from '../services/ai.js';
import { getApiKey, incrementUsage, checkUsageLimit } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml } from '../utils/helpers.js';

const NICHES = ['General','Fitness','Travel','Food','Tech','Fashion','Art','Music','Business','Photography'];
const GOALS = [{ id: 'growth', label: 'Growth' },{ id: 'leads', label: 'Leads' },{ id: 'branding', label: 'Branding' }];
const FREQUENCIES = ['Daily', '2-3 times/week', 'Weekly', 'Rarely'];
const STYLES = ['Reels Focused', 'Static Posts', 'Carousels', 'Mixed Content'];

let state = { 
    username: '', 
    bio: '', 
    niche: 'general', 
    goal: 'growth', 
    followers: '', 
    frequency: 'Daily', 
    style: 'Mixed Content',
    results: null 
};

export function renderAuditPage(container) {
    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">📋 Profile Audit 2.0</h1>
        <p class="section-subtitle">Deep strategic analysis of your Instagram presence</p>
        
        <div class="card mt-xl">
            <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" id="audit-un" placeholder="@yourusername" value="${escapeHtml(state.username)}">
            </div>
            
            <div class="form-group mt-md">
                <label class="form-label">Current Bio</label>
                <textarea class="form-textarea" id="audit-bio" placeholder="Paste your current bio..." style="min-height:90px">${escapeHtml(state.bio)}</textarea>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:var(--space-md)">
                <div class="form-group">
                    <label class="form-label">Followers</label>
                    <input type="text" class="form-input" id="audit-followers" placeholder="e.g. 1.2k" value="${escapeHtml(state.followers)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Niche</label>
                    <select class="form-input" id="audit-niche">
                        ${NICHES.map(n => `<option value="${n.toLowerCase()}" ${state.niche === n.toLowerCase() ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:var(--space-md)">
                <div class="form-group">
                    <label class="form-label">Post Frequency</label>
                    <select class="form-input" id="audit-freq">
                        ${FREQUENCIES.map(f => `<option value="${f}" ${state.frequency === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Primary Style</label>
                    <select class="form-input" id="audit-style">
                        ${STYLES.map(s => `<option value="${s}" ${state.style === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
            </div>

            <button class="btn btn-primary mt-xl" id="audit-btn" style="width:100%">
                🚀 Start Deep Scan
            </button>
        </div>
        <div id="audit-results"></div>
    </div>`;

    // Event listeners
    container.querySelector('#audit-un').oninput = e => { state.username = e.target.value; };
    container.querySelector('#audit-bio').oninput = e => { state.bio = e.target.value; };
    container.querySelector('#audit-followers').oninput = e => { state.followers = e.target.value; };
    container.querySelector('#audit-niche').onchange = e => { state.niche = e.target.value; };
    container.querySelector('#audit-freq').onchange = e => { state.frequency = e.target.value; };
    container.querySelector('#audit-style').onchange = e => { state.style = e.target.value; };
    container.querySelector('#audit-btn').onclick = handleAudit;

    if (state.results) renderResults(container);
}

async function handleAudit() {
    if (!state.bio.trim()) return showToast('Please enter your bio!', 'error');
    if (!getApiKey()) { showToast('Set API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) return showToast('Daily limit reached', 'error');

    const btn = document.querySelector('#audit-btn');
    const resultsContainer = document.querySelector('#audit-results');
    
    btn.innerHTML = '<span class="btn-loading"></span> Scanning Profile...';
    btn.disabled = true;
    
    resultsContainer.innerHTML = `
        <div class="card mt-xl">
            <div class="skeleton-line" style="width:40%"></div>
            <div class="skeleton-line" style="width:100%"></div>
            <div class="skeleton-line" style="width:100%"></div>
            <p style="text-align:center; color:var(--text-tertiary); margin-top:16px;">AI is analyzing your strategy...</p>
        </div>`;

    try {
        state.results = await generateDeepProfileAudit(
            state.username || 'user', 
            state.bio, 
            state.niche, 
            state.goal, 
            state.followers, 
            state.frequency, 
            state.style
        );
        incrementUsage();
        renderResults(document.getElementById('page-content'));
        showToast('Audit Complete!', 'success');
    } catch (err) {
        showToast('Audit failed', 'error');
        resultsContainer.innerHTML = '';
    } finally {
        btn.innerHTML = '🚀 Start Deep Scan';
        btn.disabled = false;
    }
}

function renderResults(container) {
    const resultsContainer = container.querySelector('#audit-results');
    const r = state.results;
    if (!r) return;

    const scoreColor = r.score >= 80 ? 'var(--accent-green)' : r.score >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)';

    resultsContainer.innerHTML = `
    <div class="animate-in">
        <div class="card mt-xl" style="border-top: 4px solid ${scoreColor}">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:var(--space-xl)">
                <div>
                    <h2 style="font-size:24px; font-weight:800; margin:0">Profile Health Report</h2>
                    <p style="color:var(--text-tertiary); font-size:14px;">@${escapeHtml(state.username || 'profile')}</p>
                </div>
                <div style="text-align:center; background:var(--bg-secondary); padding:12px; border-radius:var(--radius-lg); border:1px solid var(--border-subtle)">
                    <div style="font-size:28px; font-weight:900; color:${scoreColor}">${r.score}</div>
                    <div style="font-size:10px; text-transform:uppercase; color:var(--text-tertiary)">Score</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:var(--space-xl)">
                ${Object.entries(r.metrics).map(([key, val]) => `
                <div class="card-glass" style="padding:12px; text-align:center">
                    <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; margin-bottom:4px">${key}</div>
                    <div style="font-size:18px; font-weight:700">${val}/10</div>
                </div>`).join('')}
            </div>

            <div class="form-group">
                <label class="form-label" style="color:var(--text-accent)">Strategic Overview</label>
                <p style="font-size:15px; line-height:1.6; color:var(--text-primary)">${escapeHtml(r.strategy)}</p>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:var(--space-md); margin-top:var(--space-md)">
            <div class="card">
                <h3 class="feature-title" style="color:var(--accent-green)">✅ Strengths</h3>
                <ul class="suggestion-list mt-md">
                    ${r.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
            </div>
            <div class="card">
                <h3 class="feature-title" style="color:var(--accent-red)">⚠️ Weaknesses</h3>
                <ul class="suggestion-list mt-md">
                    ${r.weaknesses.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="card mt-md">
            <h3 class="feature-title">📈 30-Day Growth Roadmap</h3>
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:var(--space-lg)">
                ${r.roadmap.map((step, i) => `
                <div style="display:flex; gap:16px; align-items:start">
                    <div style="width:24px; height:24px; border-radius:50%; background:var(--bg-secondary); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0">
                        ${i + 1}
                    </div>
                    <p style="font-size:14px; color:var(--text-secondary); margin:0">${escapeHtml(step)}</p>
                </div>`).join('')}
            </div>
        </div>

        <div class="card mt-md" style="background:var(--gradient-ig-soft); border:none; color:white;">
            <div style="display:flex; justify-content:space-between; align-items:center">
                <h3 style="margin:0; font-weight:800">✨ Recommended Bio</h3>
                <button class="btn btn-sm btn-ghost" id="copy-rewritten" style="color:white; border-color:white;">📋 Copy</button>
            </div>
            <p style="margin-top:16px; font-size:16px; font-weight:500; line-height:1.5;">${escapeHtml(r.rewritten)}</p>
        </div>
    </div>`;

    container.querySelector('#copy-rewritten').onclick = () => copyToClipboard(r.rewritten);
}
