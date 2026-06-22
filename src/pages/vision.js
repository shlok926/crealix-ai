// ==================== Vision AI (Image to Caption) Page ====================
import { analyzeImage } from '../services/ai.js';
import { showToast } from '../components/toast.js';
import { escapeHtml, escapeAttr } from '../utils/helpers.js';
import { saveCaption, saveHashtag } from '../utils/storage.js';
import { renderPageShell } from '../components/pageShell.js';
import { renderEmptyState, renderLoadingState } from '../components/resultPanel.js';

export function renderVisionPage(container) {
    let base64Data = null;

    renderPageShell(container, {
        title: 'AI Vision Studio',
        subtitle: 'Upload a photo and let AI write the perfect caption and hashtags for you.',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        renderMain: (mainEl) => {
            mainEl.innerHTML = `
                <div class="form-group">
                    <div id="vision-dropzone" style="border: 2px dashed var(--border-color); border-radius: 12px; background: var(--bg-input); display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 48px 24px; cursor:pointer; transition: all 0.2s;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" style="margin-bottom:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <p style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; color:var(--text-primary); margin:0 0 8px 0;">Click or Drop Image Here</p>
                        <p style="font-size:0.85rem; color:var(--text-tertiary); margin:0;">Supports JPG, PNG, WEBP (Max 4MB)</p>
                        <input type="file" id="vision-input" accept="image/*" style="display:none" />
                    </div>

                    <div id="vision-preview-container" class="mt-xl" style="display:none">
                        <div style="position:relative; border: 1px solid var(--border-color); border-radius:12px; overflow:hidden;">
                            <img id="vision-preview" src="" style="width:100%; display:block;" />
                            <button id="remove-vision-img" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); color:white; border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                        
                        <div class="form-group mt-xl">
                            <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Context (Optional)</label>
                            <input type="text" class="gen-textarea" style="min-height:50px; border:1px solid var(--border-color); border-radius:12px; padding:16px; margin-bottom:0;" id="vision-context" placeholder="e.g. Vacation in Italy, birthday party..." />
                        </div>

                        <div class="mt-xl">
                            <button class="btn btn-primary" id="vision-analyze-btn" style="width:100%; padding: 16px; font-size:1.1rem; border-radius: 12px;">
                                <span class="btn-text">Analyze Image ✨</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Bind events for left column
            const dropzone = document.getElementById('vision-dropzone');
            const input = document.getElementById('vision-input');
            const previewContainer = document.getElementById('vision-preview-container');
            const previewImg = document.getElementById('vision-preview');
            const removeBtn = document.getElementById('remove-vision-img');
            const analyzeBtn = document.getElementById('vision-analyze-btn');

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
                document.getElementById('shell-rail-content').innerHTML = renderEmptyState('results');
            };

            analyzeBtn.onclick = async () => {
                if (!base64Data) return;
                
                analyzeBtn.disabled = true;
                analyzeBtn.classList.add('btn-loading');
                
                const railEl = document.getElementById('shell-rail-content');
                railEl.innerHTML = renderLoadingState();

                const ctxVal = document.getElementById('vision-context').value;
                const prompt = `Analyze this image. 
                Context: ${ctxVal || 'None'}
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
                    renderResult(data, railEl);
                    showToast('Analysis complete!', 'success');
                } catch (e) {
                    showToast(e.message, 'error');
                    railEl.innerHTML = renderEmptyState('results');
                } finally {
                    analyzeBtn.disabled = false;
                    analyzeBtn.classList.remove('btn-loading');
                }
            };
        },
        renderRail: (railEl) => {
            railEl.innerHTML = renderEmptyState('results');
        }
    });



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

    function renderResult(data, railEl) {
        window.saveVisionCaption = () => { saveCaption(data.caption); showToast('Caption saved!', 'success'); };
        window.saveVisionHash = () => { saveHashtag(data.hashtags, 'Vision Generated Tags'); showToast('Hashtags saved!', 'success'); };
        
        railEl.innerHTML = `
        <div class="card" style="padding: 24px;">
            <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 16px;">AI Description</h3>
            <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:24px;">${escapeHtml(data.description)}</p>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin:0;">Generated Caption</h3>
                <div style="display:flex; gap:8px;">
                    <button class="btn-icon" title="Copy Caption" onclick="window.copyToClipboard('${escapeAttr(data.caption)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                    <button class="btn-icon" title="Save Caption" onclick="window.saveVisionCaption()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></button>
                </div>
            </div>
            <div style="background:var(--bg-input); border:1px solid var(--border-color); border-radius:12px; padding:16px; font-family:'Inter', sans-serif; font-size:0.95rem; line-height:1.6; white-space:pre-wrap; margin-bottom:24px;">${escapeHtml(data.caption)}</div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin:0;">Optimized Hashtags</h3>
                <div style="display:flex; gap:8px;">
                    <button class="btn-icon" title="Copy Hashtags" onclick="window.copyToClipboard('${escapeAttr(data.hashtags)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                    <button class="btn-icon" title="Save Hashtags" onclick="window.saveVisionHash()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></button>
                </div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
                ${data.hashtags.split(/\s+/).map(t => `<span class="hashtag-list-chip" onclick="window.copyToClipboard('${escapeAttr(t)}')">${escapeHtml(t)}</span>`).join('')}
            </div>
        </div>`;
    }
}
