import { getBrandVoice, setBrandVoice, exportAllUserData } from '../utils/storage.js';
import { showToast } from './toast.js';
import { auth } from '../services/firebase.js';
import { updatePassword, deleteUser } from 'firebase/auth';

export function openSettingsModal() {
    const overlay = document.getElementById('modal-overlay');
    const voice = getBrandVoice();

    overlay.innerHTML = `
    <div class="modal" id="settings-modal" style="max-width:500px">
      <div class="modal-header">
        <h2 class="modal-title">⚙️ Settings</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      
      <div class="modal-tabs" style="display:flex;gap:var(--space-md);margin-bottom:var(--space-lg);border-bottom:1px solid var(--border-color);padding-bottom:var(--space-sm)">
        <button class="tab-link active" data-tab="account-tab" style="background:none;border:none;color:var(--text-primary);font-weight:600;cursor:pointer;padding:4px 8px;border-bottom:2px solid var(--accent-purple)">Account & Security</button>
        <button class="tab-link" data-tab="voice-tab" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:4px 8px">Brand Voice</button>
      </div>

      <div id="account-tab" class="tab-content">
        <!-- Update Password -->
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-md);">
          <h3 style="font-size: 1rem; margin-bottom: 4px;">Update password</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-md);">Use a long, random password to keep your account secure.</p>
          <div style="display:flex; gap: var(--space-sm); margin-bottom: var(--space-sm);">
            <div style="flex:1">
              <label class="form-label" style="font-size: 0.75rem;">NEW PASSWORD</label>
              <input type="password" id="sec-new-pwd" class="form-input" style="width:100%" placeholder="••••••••">
            </div>
            <div style="flex:1">
              <label class="form-label" style="font-size: 0.75rem;">CONFIRM PASSWORD</label>
              <input type="password" id="sec-confirm-pwd" class="form-input" style="width:100%" placeholder="••••••••">
            </div>
          </div>
          <button id="btn-update-pwd" class="btn btn-primary" style="font-size:0.85rem; padding: 6px 12px;">Update Password</button>
        </div>

        <!-- Download Data -->
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-md);">
          <h3 style="font-size: 1rem; margin-bottom: 4px;">Download your data</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-md);">Export your full account data as a JSON archive.</p>
          <button id="btn-export-data" class="btn btn-primary" style="font-size:0.85rem; padding: 6px 12px; background: #2563eb;">Download Data (.json)</button>
        </div>

        <!-- Deactivate Account -->
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); border-color: rgba(220, 38, 38, 0.3);">
          <h3 style="font-size: 1rem; margin-bottom: 4px; color: #ef4444;">Deactivate account</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-md);">This will permanently delete your account and all associated cloud data.</p>
          <button id="btn-delete-account" class="btn btn-secondary" style="font-size:0.85rem; padding: 6px 12px; color: #ef4444; border-color: #ef4444;">Deactivate My Account</button>
        </div>
      </div>

      <div id="voice-tab" class="tab-content" style="display:none">
        <div class="form-group" style="margin-bottom:var(--space-md)">
          <label class="form-label">Brand / Display Name</label>
          <input type="text" id="voice-name" class="form-input" placeholder="e.g. Alex Media" value="${voice.name || ''}">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-md)">
          <label class="form-label">Primary Niche</label>
          <input type="text" id="voice-niche" class="form-input" placeholder="e.g. Travel Photography" value="${voice.niche || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Default Target Tone</label>
          <select id="voice-tone" class="form-input">
            ${['Professional', 'Casual', 'Bold', 'Aesthetic', 'Funny', 'Gen-Z'].map(t => `
              <option value="${t}" ${voice.tone === t ? 'selected' : ''}>${t}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div style="margin-top:var(--space-xl);display:flex;gap:var(--space-sm);justify-content:flex-end">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">Save Settings</button>
      </div>
    </div>
  `;

    overlay.classList.add('open');

    // Tab Switching
    overlay.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', () => {
            overlay.querySelectorAll('.tab-link').forEach(l => {
                l.classList.remove('active');
                l.style.borderBottom = 'none';
                l.style.color = 'var(--text-secondary)';
            });
            overlay.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            
            link.classList.add('active');
            link.style.borderBottom = '2px solid var(--accent-purple)';
            link.style.color = 'var(--text-primary)';
            document.getElementById(link.dataset.tab).style.display = 'block';
        });
    });

    const closeModal = () => overlay.classList.remove('open');

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.getElementById('modal-save-btn').addEventListener('click', () => {
        const vName = document.getElementById('voice-name').value.trim();
        const vNiche = document.getElementById('voice-niche').value.trim();
        const vTone = document.getElementById('voice-tone').value;

        setBrandVoice({ name: vName, niche: vNiche, tone: vTone });
        
        showToast('Settings updated successfully! ✨', 'success');
        closeModal();
    });

    // Account & Security Handlers
    document.getElementById('btn-export-data')?.addEventListener('click', () => {
        exportAllUserData();
        showToast('Data exported successfully!', 'success');
    });

    document.getElementById('btn-update-pwd')?.addEventListener('click', async () => {
        const newPwd = document.getElementById('sec-new-pwd').value;
        const confPwd = document.getElementById('sec-confirm-pwd').value;
        
        if (!newPwd || !confPwd) return showToast('Please fill both fields.', 'error');
        if (newPwd !== confPwd) return showToast('Passwords do not match.', 'error');
        if (newPwd.length < 6) return showToast('Password must be at least 6 characters.', 'error');

        const user = auth.currentUser;
        if (!user) return showToast('You must be logged in to update your password.', 'error');

        try {
            await updatePassword(user, newPwd);
            showToast('Password updated successfully!', 'success');
            document.getElementById('sec-new-pwd').value = '';
            document.getElementById('sec-confirm-pwd').value = '';
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                showToast('Please log out and log back in to change your password.', 'error');
            } else {
                showToast('Failed to update password: ' + error.message, 'error');
            }
        }
    });

    document.getElementById('btn-delete-account')?.addEventListener('click', async () => {
        const confirmDelete = confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
        if (!confirmDelete) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            await deleteUser(user);
            showToast('Account deleted successfully.', 'success');
            closeModal();
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

