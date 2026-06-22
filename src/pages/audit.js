// ==================== Profile Audit 2.0 Page ====================
import { generateDeepProfileAudit } from '../services/ai.js';
import { getApiKey, incrementUsage, checkUsageLimit } from '../utils/storage.js';
import { copyToClipboard } from '../utils/copy.js';
import { showToast } from '../components/toast.js';
import { openSettingsModal } from '../components/modal.js';
import { escapeHtml } from '../utils/helpers.js';
import { renderPageShell } from '../components/pageShell.js';
import { renderPillGroup, handlePillGroupClick } from '../components/pillGroup.js';
import { renderEmptyState, renderLoadingState } from '../components/resultPanel.js';
import { saveItemToCloud, fetchItemsFromCloud } from '../services/cloudStorage.js';
import { auth } from '../services/firebase.js';

const NICHES = [
    { id: 'general', label: 'General' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'travel', label: 'Travel' },
    { id: 'food', label: 'Food' },
    { id: 'tech', label: 'Tech' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'business', label: 'Business' }
];

const FOLLOWERS = [
    { id: '0-1k', label: '0-1k' },
    { id: '1k-10k', label: '1k-10k' },
    { id: '10k-100k', label: '10k-100k' },
    { id: '100k+', label: '100k+' }
];

let state = { 
    username: '', 
    bio: '', 
    niche: 'general', 
    followers: '0-1k', 
    results: null,
    pastAudits: []
};

export async function renderAuditPage(container) {
    if (auth.currentUser) {
        try {
            state.pastAudits = await fetchItemsFromCloud(auth.currentUser.uid, 'audits');
        } catch (e) {
            console.error('Failed to fetch audits:', e);
            state.pastAudits = [];
        }
    }

    renderPageShell(container, {
        title: 'Profile Audit 2.0',
        subtitle: 'AI strategy report based on what you share.',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        renderMain: (mainEl) => {
            mainEl.innerHTML = `
                <div class="form-group">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Instagram Username</label>
                    <input type="text" class="gen-textarea" style="min-height:50px; border:1px solid var(--border-color); border-radius:12px; padding:16px;" id="audit-un" placeholder="@yourusername" value="${escapeHtml(state.username)}">
                </div>
                
                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Current Bio</label>
                    <textarea class="gen-textarea" id="audit-bio" placeholder="Paste your current bio...">${escapeHtml(state.bio)}</textarea>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Followers Range</label>
                    <div id="followers-chips">
                        ${renderPillGroup(FOLLOWERS, state.followers)}
                    </div>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Niche</label>
                    <div id="niche-chips">
                        ${renderPillGroup(NICHES, state.niche)}
                    </div>
                </div>

                <div class="mt-xl" style="display:flex; justify-content:space-between; align-items:center;">
                    <button class="btn btn-primary" id="audit-btn" style="flex:1; padding: 16px; font-size:1.1rem; border-radius: 12px; margin-right: 16px;">
                        <span class="btn-text">Start Deep Scan 🚀</span>
                    </button>
                    ${state.pastAudits.length > 0 ? `<button class="btn btn-secondary" id="view-past-audits" style="padding: 16px; border-radius: 12px;">View Past Audits</button>` : ''}
                </div>
            `;

            // Event listeners
            mainEl.querySelector('#audit-un').oninput = e => { state.username = e.target.value.replace('@', ''); };
            mainEl.querySelector('#audit-bio').oninput = e => { state.bio = e.target.value; };
            mainEl.querySelector('#followers-chips').addEventListener('click', e => handlePillGroupClick(e, state.followers, v => state.followers = v));
            mainEl.querySelector('#niche-chips').addEventListener('click', e => handlePillGroupClick(e, state.niche, v => state.niche = v));
            mainEl.querySelector('#audit-btn').onclick = () => handleAudit(mainEl);

            const pastBtn = mainEl.querySelector('#view-past-audits');
            if (pastBtn) {
                pastBtn.onclick = () => {
                    renderPastAudits(document.getElementById('shell-rail-content'));
                };
            }
        },
        renderRail: (railEl) => {
            railEl.innerHTML = renderEmptyState('strategy reports');
        }
    });
}

async function handleAudit(mainEl) {
    if (!state.username.trim() || !state.bio.trim()) return showToast('Please enter username and bio!', 'error');
    if (!getApiKey()) { showToast('Set API key first', 'error'); openSettingsModal(); return; }
    if (!checkUsageLimit()) return showToast('Daily limit reached', 'error');

    const btn = mainEl.querySelector('#audit-btn');
    const railEl = document.getElementById('shell-rail-content');
    
    btn.classList.add('btn-loading');
    btn.disabled = true;
    railEl.innerHTML = renderLoadingState();

    try {
        state.results = await generateDeepProfileAudit(
            state.username, 
            state.bio, 
            state.niche, 
            'growth', // Removed goal from UI, keep constant for now or let AI infer
            state.followers, 
            'Daily', // Removed frequency from UI to simplify
            'Mixed' // Removed style from UI to simplify
        );
        incrementUsage();

        // Save to cloud if logged in
        if (auth.currentUser) {
            const auditData = {
                username: state.username,
                bio: state.bio,
                followers: state.followers,
                niche: state.niche,
                results: state.results
            };
            const id = await saveItemToCloud(auth.currentUser.uid, 'audits', auditData);
            state.pastAudits.unshift({ id, ...auditData, savedAt: new Date().toISOString() });
        }

        renderResults(railEl);
        showToast('Audit Complete!', 'success');
    } catch (err) {
        showToast('Audit failed', 'error');
        railEl.innerHTML = renderEmptyState('strategy reports');
    } finally {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}

function renderResults(railEl) {
    const r = state.results;
    if (!r) return;

    // Check for previous audit of same username to show comparison strip
    let comparisonHtml = '';
    const previousAudit = state.pastAudits.find(a => a.username.toLowerCase() === state.username.toLowerCase() && new Date(a.savedAt).getTime() < new Date().getTime() - 1000); // Find older audit

    if (previousAudit) {
        const scoreDiff = r.score - previousAudit.results.score;
        const diffText = scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff;
        const diffColor = scoreDiff > 0 ? 'var(--accent-green)' : (scoreDiff < 0 ? 'var(--accent-red)' : 'var(--text-secondary)');
        
        comparisonHtml = `
            <div style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:12px; padding:12px 16px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:500;">Since your last audit</span>
                <div style="display:flex; gap:16px; align-items:center;">
                    <span style="font-size:0.85rem; color:var(--text-primary);">Score: <span style="color:${diffColor}; font-weight:600;">${diffText}</span></span>
                    <span style="font-size:0.85rem; color:var(--text-primary);">Followers: <span style="font-weight:600;">${state.followers !== previousAudit.followers ? `${previousAudit.followers} → ${state.followers}` : 'Unchanged'}</span></span>
                </div>
            </div>
        `;
    }

    const scoreColor = r.score >= 80 ? 'var(--accent-green)' : r.score >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)';

    railEl.innerHTML = `
    <div class="animate-in" style="padding-bottom: 32px;">
        ${comparisonHtml}

        <div class="card" style="border-top: 4px solid ${scoreColor}; padding: 24px; margin-bottom: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:24px;">
                <div>
                    <h2 style="font-size:1.4rem; font-family:'Space Grotesk', sans-serif; font-weight:700; margin:0 0 4px 0;">Profile Health</h2>
                    <p style="color:var(--text-secondary); font-size:0.9rem; margin:0;">@${escapeHtml(state.username)}</p>
                </div>
                <div style="text-align:center; background:var(--bg-input); padding:12px 16px; border-radius:12px; border:1px solid var(--border-color);">
                    <div style="font-size:1.8rem; font-weight:800; color:${scoreColor}; font-family:'Space Grotesk', sans-serif;">${r.score}</div>
                    <div style="font-size:0.7rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:600; letter-spacing:1px;">Score</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
                ${Object.entries(r.metrics).map(([key, val]) => `
                <div style="background:var(--bg-secondary); padding:12px 8px; border-radius:8px; text-align:center; border:1px solid var(--border-subtle);">
                    <div style="font-size:0.65rem; color:var(--text-tertiary); text-transform:uppercase; font-weight:600; letter-spacing:0.5px; margin-bottom:4px">${key}</div>
                    <div style="font-size:1rem; font-weight:700; color:var(--text-primary);">${val}/10</div>
                </div>`).join('')}
            </div>
        </div>

        <div class="card" style="padding: 24px; margin-bottom: 24px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 16px;">Bio Feedback</h3>
            <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6; margin-bottom:24px;">${escapeHtml(r.bioFeedback)}</p>
            
            <div style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-size:0.85rem; font-weight:600; color:var(--primary-color); text-transform:uppercase; letter-spacing:0.5px;">Recommended Rewrite</span>
                    <button class="btn-icon" title="Copy Rewrite" id="copy-rewrite-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                </div>
                <p style="font-size:1rem; color:var(--text-primary); font-family:'Inter', sans-serif; white-space:pre-wrap; margin:0; line-height:1.5;">${escapeHtml(r.rewritten)}</p>
            </div>
        </div>

        <div class="card" style="padding: 24px; margin-bottom: 24px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 16px; color:var(--accent-orange);">⚡ Quick Wins</h3>
            <ul style="margin:0; padding-left:20px; color:var(--text-secondary); font-size:0.95rem; line-height:1.6;">
                ${r.quickWins.map(w => `<li style="margin-bottom:8px;">${escapeHtml(w)}</li>`).join('')}
            </ul>
        </div>

        <div class="card" style="padding: 24px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 16px; color:var(--primary-color);">📅 30-Day Content Plan</h3>
            <div style="display:flex; flex-direction:column; gap:16px;">
                ${r.contentPlan.map(plan => `
                <div style="background:var(--bg-input); border-radius:8px; padding:12px 16px; border-left:3px solid var(--primary-color);">
                    <p style="font-size:0.95rem; color:var(--text-primary); margin:0; line-height:1.5;">${escapeHtml(plan)}</p>
                </div>`).join('')}
            </div>
        </div>
    </div>`;

    railEl.querySelector('#copy-rewrite-btn').onclick = () => {
        copyToClipboard(r.rewritten);
        showToast('Bio copied!', 'success');
    };
}

function renderPastAudits(railEl) {
    if (state.pastAudits.length === 0) {
        railEl.innerHTML = `<div style="padding: 48px 24px; text-align:center; color:var(--text-tertiary);">No past audits found.</div>`;
        return;
    }

    const listHtml = state.pastAudits.map((audit, index) => {
        const date = new Date(audit.savedAt).toLocaleDateString();
        const score = audit.results?.score || '--';
        return `
        <div class="card" style="padding: 16px; margin-bottom: 12px; cursor:pointer; transition:all 0.2s; border:1px solid var(--border-color);" onclick="window.loadPastAudit(${index})">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:600; color:var(--text-primary);">@${escapeHtml(audit.username)}</div>
                    <div style="font-size:0.8rem; color:var(--text-tertiary); margin-top:4px;">${date} • ${audit.followers}</div>
                </div>
                <div style="font-size:1.2rem; font-weight:800; color:var(--primary-color); font-family:'Space Grotesk', sans-serif;">
                    ${score}
                </div>
            </div>
        </div>
        `;
    }).join('');

    railEl.innerHTML = `
    <div class="animate-in" style="padding-bottom: 32px;">
        <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.2rem; margin-bottom: 24px; display:flex; justify-content:space-between; align-items:center;">
            Past Audits
            <button class="btn-icon" title="Close" onclick="document.getElementById('audit-btn').click()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </h3>
        ${listHtml}
    </div>
    `;

    window.loadPastAudit = (index) => {
        const audit = state.pastAudits[index];
        state.username = audit.username;
        state.bio = audit.bio;
        state.followers = audit.followers;
        state.niche = audit.niche;
        state.results = audit.results;
        
        // Update input fields visually
        document.getElementById('audit-un').value = state.username;
        document.getElementById('audit-bio').value = state.bio;
        
        // Re-render chips to show selection
        document.getElementById('followers-chips').innerHTML = renderPillGroup(FOLLOWERS, state.followers);
        document.getElementById('niche-chips').innerHTML = renderPillGroup(NICHES, state.niche);
        
        renderResults(railEl);
    };
}
