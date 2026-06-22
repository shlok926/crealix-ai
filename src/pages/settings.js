import { getBrandVoice, setBrandVoice, exportAllUserData } from '../utils/storage.js';
import { showToast } from '../components/toast.js';
import { auth } from '../services/firebase.js';
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export async function renderSettings(container) {
    const voice = getBrandVoice();
    const user = auth.currentUser;

    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">⚙️ Settings</h1>
        <p class="section-subtitle">Manage your account, security, and AI preferences.</p>

        <!-- Brand Voice -->
        <div class="card mt-xl" style="padding: var(--space-xl);">
            <h3 class="feature-title" style="margin-bottom:var(--space-md);">🎙️ Brand Voice</h3>
            <p style="color:var(--text-secondary); margin-bottom:var(--space-lg); font-size:0.9rem;">Set your global AI persona so you don't have to repeat your niche and tone every time.</p>
            
            <div class="form-group" style="margin-bottom:var(--space-md)">
                <label class="form-label">Brand / Display Name</label>
                <input type="text" id="voice-name" class="form-input" placeholder="e.g. Alex Media" value="${voice.name || ''}">
            </div>
            <div class="form-group" style="margin-bottom:var(--space-md)">
                <label class="form-label">Primary Niche</label>
                <input type="text" id="voice-niche" class="form-input" placeholder="e.g. Travel Photography" value="${voice.niche || ''}">
            </div>
            <div class="form-group" style="margin-bottom:var(--space-lg)">
                <label class="form-label">Default Target Tone</label>
                <!-- Style to fix dark mode dropdown visibility issue -->
                <select id="voice-tone" class="form-input" style="color: #000; background-color: #fff;">
                    ${['Professional', 'Casual', 'Bold', 'Aesthetic', 'Funny', 'Gen-Z'].map(t => `
                    <option value="${t}" ${voice.tone === t ? 'selected' : ''}>${t}</option>
                    `).join('')}
                </select>
            </div>
            <button id="btn-save-voice" class="btn btn-primary">Save Brand Voice</button>
        </div>

        <!-- Account & Security -->
        <div class="card mt-xl" style="padding: var(--space-xl);">
            <h3 class="feature-title" style="margin-bottom:var(--space-md);">🔒 Account & Security</h3>
            
            ${user?.providerData?.some(p => p.providerId === 'password') ? `
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-xl);">
                <h4 style="font-size: 1.05rem; margin-bottom: 4px; font-weight:600;">Update Password</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--space-md);">Change your login password. We need your current password to verify it's you.</p>
                
                <div class="form-group" style="margin-bottom:var(--space-md)">
                    <label class="form-label" style="font-size: 0.75rem;">CURRENT PASSWORD</label>
                    <input type="password" id="sec-current-pwd" class="form-input" placeholder="••••••••">
                </div>
                <div style="display:flex; gap: var(--space-sm); margin-bottom: var(--space-md);">
                    <div style="flex:1">
                        <label class="form-label" style="font-size: 0.75rem;">NEW PASSWORD</label>
                        <input type="password" id="sec-new-pwd" class="form-input" placeholder="••••••••">
                    </div>
                    <div style="flex:1">
                        <label class="form-label" style="font-size: 0.75rem;">CONFIRM NEW PASSWORD</label>
                        <input type="password" id="sec-confirm-pwd" class="form-input" placeholder="••••••••">
                    </div>
                </div>
                <button id="btn-update-pwd" class="btn btn-primary" style="font-size:0.85rem; padding: 6px 12px;">Update Password</button>
            </div>
            ` : `
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-xl);">
                <p style="font-size: 0.9rem; color: var(--text-secondary);">You are signed in with Google. Password updates are managed by your Google account.</p>
            </div>
            `}

            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-xl);">
                <h4 style="font-size: 1.05rem; margin-bottom: 4px; font-weight:600;">Download your data</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--space-md);">Export your full account data as a JSON archive.</p>
                <button id="btn-export-data" class="btn btn-primary" style="font-size:0.85rem; padding: 6px 12px; background: #2563eb;">Download Data (.json)</button>
            </div>

            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); border-color: rgba(220, 38, 38, 0.3);">
                <h4 style="font-size: 1.05rem; margin-bottom: 4px; font-weight:600; color: #ef4444;">Deactivate account</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--space-md);">This will permanently delete your account and all associated cloud data.</p>
                <button id="btn-delete-account" class="btn btn-secondary" style="font-size:0.85rem; padding: 6px 12px; color: #ef4444; border-color: #ef4444;">Deactivate My Account</button>
            </div>
        </div>
    </div>`;

    document.getElementById('btn-save-voice')?.addEventListener('click', () => {
        const vName = document.getElementById('voice-name').value.trim();
        const vNiche = document.getElementById('voice-niche').value.trim();
        const vTone = document.getElementById('voice-tone').value;
        setBrandVoice({ name: vName, niche: vNiche, tone: vTone });
        showToast('Brand Voice saved successfully! ✨', 'success');
    });

    document.getElementById('btn-export-data')?.addEventListener('click', () => {
        exportAllUserData();
        showToast('Data exported successfully!', 'success');
    });

    document.getElementById('btn-update-pwd')?.addEventListener('click', async () => {
        const currentPwd = document.getElementById('sec-current-pwd').value;
        const newPwd = document.getElementById('sec-new-pwd').value;
        const confPwd = document.getElementById('sec-confirm-pwd').value;
        
        if (!currentPwd || !newPwd || !confPwd) return showToast('Please fill all password fields.', 'error');
        if (newPwd !== confPwd) return showToast('New passwords do not match.', 'error');
        if (newPwd.length < 6) return showToast('New password must be at least 6 characters.', 'error');

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(currentUser.email, currentPwd);
            await reauthenticateWithCredential(currentUser, credential);
            
            // Then update
            await updatePassword(currentUser, newPwd);
            showToast('Password updated successfully!', 'success');
            
            document.getElementById('sec-current-pwd').value = '';
            document.getElementById('sec-new-pwd').value = '';
            document.getElementById('sec-confirm-pwd').value = '';
        } catch (error) {
            console.error(error);
            showToast('Failed to update: ' + error.message, 'error');
        }
    });

    document.getElementById('btn-delete-account')?.addEventListener('click', async () => {
        const confirmDelete = confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
        if (!confirmDelete) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            await deleteUser(currentUser);
            showToast('Account deleted successfully.', 'success');
            window.location.hash = '#/';
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                showToast('Please log out and log back in to delete your account.', 'error');
            } else {
                showToast('Failed to delete account: ' + error.message, 'error');
            }
        }
    });
}
