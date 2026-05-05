import { getApiKey, setApiKey, getBrandVoice, setBrandVoice } from '../utils/storage.js';
import { showToast } from './toast.js';

export function openSettingsModal() {
    const overlay = document.getElementById('modal-overlay');
    const currentKey = getApiKey();
    const voice = getBrandVoice();

    overlay.innerHTML = `
    <div class="modal" id="settings-modal" style="max-width:500px">
      <div class="modal-header">
        <h2 class="modal-title">⚙️ Settings</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      
      <div class="modal-tabs" style="display:flex;gap:var(--space-md);margin-bottom:var(--space-lg);border-bottom:1px solid var(--border-color);padding-bottom:var(--space-sm)">
        <button class="tab-link active" data-tab="api-tab" style="background:none;border:none;color:var(--text-primary);font-weight:600;cursor:pointer;padding:4px 8px;border-bottom:2px solid var(--accent-purple)">API Config</button>
        <button class="tab-link" data-tab="voice-tab" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:4px 8px">Brand Voice</button>
      </div>

      <div id="api-tab" class="tab-content">
        <div class="form-group">
          <label class="form-label">
            OpenRouter API Key
            <span class="form-label-sub"> — Required to generate content</span>
          </label>
          <div style="position:relative">
            <input 
              type="password" 
              class="form-input" 
              id="api-key-input" 
              placeholder="sk-or-v1-..." 
              value="${currentKey}"
              autocomplete="off"
            />
            <button class="btn-ghost" id="toggle-key-visibility" 
              style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:18px">
              👁
            </button>
          </div>
          <p style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-top:var(--space-xs)">
            Your API key is stored locally in your browser. Get one at <a href="https://openrouter.ai/" target="_blank" rel="noopener" style="color:var(--text-accent)">openrouter.ai</a>
          </p>
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

    document.getElementById('toggle-key-visibility').addEventListener('click', () => {
        const input = document.getElementById('api-key-input');
        input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('modal-save-btn').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value.trim();
        const vName = document.getElementById('voice-name').value.trim();
        const vNiche = document.getElementById('voice-niche').value.trim();
        const vTone = document.getElementById('voice-tone').value;

        setApiKey(key);
        setBrandVoice({ name: vName, niche: vNiche, tone: vTone });
        
        showToast('Settings updated successfully! ✨', 'success');
        closeModal();
    });
}

