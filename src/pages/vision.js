// ==================== Vision AI (Image to Caption) Page ====================
import { analyzeImage } from '../services/ai.js';
import { showToast } from '../components/toast.js';
import { escapeHtml } from '../utils/helpers.js';
import { saveCaption, saveHashtag } from '../utils/storage.js';

export function renderVisionPage(container) {
    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">AI Vision Studio</h1>
        <p class="section-subtitle">Upload a photo and let AI write the perfect caption and hashtags for you</p>

        <div class="card" id="vision-dropzone" style="border: 2px dashed var(--border-subtle); background: var(--bg-card); display:flex; flex-direction:column; align-items:center; justify-content:center; padding: var(--space-3xl); cursor:pointer; transition: all var(--transition-fast);">
            <div style="font-size: 48px; margin-bottom: 16px;">📸</div>
            <p style="font-weight:600; color:var(--text-primary)">Click or Drop an Image Here</p>
            <p style="font-size:12px; color:var(--text-tertiary); margin-top:8px;">Supports JPG, PNG, WEBP (Max 4MB)</p>
            <input type="file" id="vision-input" accept="image/*" style="display:none" />
        </div>

        <div id="vision-preview-container" class="mt-lg" style="display:none">
            <div class="card" style="padding: var(--space-md); position:relative;">
                <img id="vision-preview" src="" style="width:100%; border-radius:var(--radius-md); display:block;" />
                <button id="remove-vision-img" class="btn-icon" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.5); color:white; border:none;">✕</button>
            </div>
            
            <div class="form-group mt-xl">
                <label class="form-label">Context (Optional)</label>
                <input type="text" class="form-input" id="vision-context" placeholder="e.g. Vacation in Italy, birthday party..." />
            </div>

            <button class="btn btn-primary mt-xl" id="vision-analyze-btn" style="width:100%">
                Analyze Image & Write Caption
            </button>
        </div>

        <div id="vision-result" class="mt-2xl"></div>
    </div>`;

    const dropzone = container.querySelector('#vision-dropzone');
    const input = container.querySelector('#vision-input');
    const previewContainer = container.querySelector('#vision-preview-container');
    const previewImg = container.querySelector('#vision-preview');
    const removeBtn = container.querySelector('#remove-vision-img');
    const analyzeBtn = container.querySelector('#vision-analyze-btn');
    const resultDiv = container.querySelector('#vision-result');
    const contextInput = container.querySelector('#vision-context');

    let base64Data = null;

    // Handle Upload
    dropzone.onclick = () => input.click();
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) return showToast('File too large (max 4MB)', 'error');

        const reader = new FileReader();
        reader.onload = (event) => {
            base64Data = event.target.result;
            previewImg.src = base64Data;
            dropzone.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    };

    removeBtn.onclick = () => {
        base64Data = null;
        input.value = '';
        dropzone.style.display = 'flex';
        previewContainer.style.display = 'none';
        resultDiv.innerHTML = '';
    };

    // Analyze Action
    analyzeBtn.onclick = async () => {
        if (!base64Data) return;
        
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="btn-loading"></span> Analyzing Image...';
        resultDiv.innerHTML = `
        <div class="card skeleton-card">
            <div class="skeleton-line" style="width:80%"></div>
            <div class="skeleton-line" style="width:100%"></div>
            <div class="skeleton-line" style="width:60%"></div>
        </div>`;

        const prompt = `Analyze this image. 
        Context: ${contextInput.value || 'None'}
        Task: 
        1. Briefly describe what is in the image.
        2. Write a highly engaging, viral Instagram caption (with 2-3 emojis, a hook, and a CTA).
        3. Suggest 10 relevant hashtags.
        Format EXACTLY as:
        [DESCRIPTION] ...
        [CAPTION] ...
        [HASHTAGS] #tag1 #tag2 ...
        No explanation.`;

        try {
            const raw = await analyzeImage(base64Data, prompt);
            const data = parseVisionResult(raw);
            renderResult(data);
            showToast('Analysis complete!', 'success');
        } catch (e) {
            showToast(e.message, 'error');
            resultDiv.innerHTML = '';
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Analyze Image & Write Caption';
        }
    };

    function parseVisionResult(raw) {
        const get = (tag) => {
            const m = raw.match(new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`));
            return m ? m[1].trim() : '';
        };
        return {
            description: get('DESCRIPTION'),
            caption: get('CAPTION'),
            hashtags: get('HASHTAGS')
        };
    }

    function renderResult(data) {
        resultDiv.innerHTML = `
        <div class="card result-card">
            <div class="form-group">
                <label class="form-label" style="color:var(--text-tertiary)">AI Description</label>
                <p style="font-size:14px; margin-bottom:var(--space-lg)">${escapeHtml(data.description)}</p>
            </div>

            <div class="form-group mt-lg">
                <label class="form-label">Generated Caption</label>
                <div class="card-glass mt-sm" style="white-space:pre-wrap; font-size:15px;">${escapeHtml(data.caption)}</div>
                <div class="mt-sm" style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="copy-vis-cap">📋 Copy Caption</button>
                    <button class="btn btn-sm btn-ghost" id="save-vis-cap">💾 Save</button>
                </div>
            </div>

            <div class="form-group mt-xl">
                <label class="form-label">Optimized Hashtags</label>
                <div class="hashtag-pills mt-sm">
                    ${data.hashtags.split(/\s+/).map(t => `<span class="hashtag-pill">${escapeHtml(t)}</span>`).join('')}
                </div>
                <div class="mt-sm" style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="copy-vis-hash">📋 Copy Hashtags</button>
                    <button class="btn btn-sm btn-ghost" id="save-vis-hash">💾 Save Set</button>
                </div>
            </div>
        </div>`;

        // Bind copy/save actions
        resultDiv.querySelector('#copy-vis-cap').onclick = () => {
            navigator.clipboard.writeText(data.caption);
            showToast('Caption copied!', 'success');
        };
        resultDiv.querySelector('#copy-vis-hash').onclick = () => {
            navigator.clipboard.writeText(data.hashtags);
            showToast('Hashtags copied!', 'success');
        };
        resultDiv.querySelector('#save-vis-cap').onclick = () => {
            saveCaption(data.caption);
            showToast('Caption saved!', 'success');
        };
        resultDiv.querySelector('#save-vis-hash').onclick = () => {
            saveHashtag(data.hashtags, 'Vision Generated Tags');
            showToast('Hashtags saved!', 'success');
        };
    }
}
