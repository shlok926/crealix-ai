// ==================== AI Image Generator Page ====================
import { generateAiImage, enhanceImagePrompt } from '../services/imageAi.js';
import { showToast } from '../components/toast.js';
import { escapeHtml } from '../utils/helpers.js';
import { saveItemToCloud } from '../services/cloudStorage.js';
import { auth } from '../services/firebase.js';
import { renderPageShell } from '../components/pageShell.js';
import { renderPillGroup, handlePillGroupClick } from '../components/pillGroup.js';
import { renderHelperHint } from '../components/helperHint.js';
import { renderEmptyState, renderLoadingState } from '../components/resultPanel.js';

const RATIOS = [
    { id: '1:1', label: 'Square (1:1)' },
    { id: '4:5', label: 'Portrait (4:5)' },
    { id: '16:9', label: 'Landscape (16:9)' }
];

export function renderImageGenerator(container) {
    let selectedRatio = '1:1';

    renderPageShell(container, {
        title: 'AI Image Studio',
        subtitle: 'Turn your ideas into viral Instagram posts with Flux AI.',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        renderMain: (mainEl) => {
            mainEl.innerHTML = `
                <div class="form-group">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">What do you want to create?</label>
                    <div class="gen-textarea-wrapper">
                        <textarea class="gen-textarea" id="img-prompt" placeholder="e.g. A futuristic coffee shop in Bali with neon lights and jungle vibes..."></textarea>
                        <div class="gen-textarea-footer-left">
                            <button class="btn btn-sm btn-ghost" id="enhance-prompt-btn" style="padding: 4px 8px; font-size: 0.8rem;">✨ Enhance with AI</button>
                        </div>
                    </div>
                </div>

                <div class="form-group mt-xl">
                    <label class="form-label" style="font-family:'Space Grotesk', sans-serif;">Aspect Ratio</label>
                    <div id="ratio-chips">
                        ${renderPillGroup(RATIOS, selectedRatio)}
                    </div>
                </div>

                <div class="mt-xl">
                    <button class="btn btn-primary" id="generate-img-btn" style="width:100%; padding: 16px; font-size:1.1rem; border-radius: 12px;">
                        <span class="btn-text">Generate Masterpiece 🎨</span>
                    </button>
                </div>
            `;

            const promptInput = document.getElementById('img-prompt');
            const enhanceBtn = document.getElementById('enhance-prompt-btn');
            const generateBtn = document.getElementById('generate-img-btn');

            document.getElementById('ratio-chips').addEventListener('click', e => handlePillGroupClick(e, selectedRatio, v => selectedRatio = v));

            // Enhance Prompt
            enhanceBtn.onclick = async () => {
                const val = promptInput.value.trim();
                if (!val) return showToast('Please enter a basic idea first', 'info');
                
                enhanceBtn.disabled = true;
                enhanceBtn.textContent = 'Enhancing...';
                
                try {
                    const enhanced = await enhanceImagePrompt(val);
                    promptInput.value = enhanced;
                    showToast('Prompt enhanced!', 'success');
                } catch (e) {
                    showToast('Failed to enhance prompt', 'error');
                } finally {
                    enhanceBtn.disabled = false;
                    enhanceBtn.textContent = '✨ Enhance with AI';
                }
            };


            // Generate Image
            generateBtn.onclick = async () => {
                const prompt = promptInput.value.trim();
                if (!prompt) return showToast('Please enter a prompt', 'error');

                generateBtn.disabled = true;
                generateBtn.classList.add('btn-loading');
                
                const railEl = document.getElementById('shell-rail-content');
                railEl.innerHTML = renderLoadingState();

                try {
                    const imageUrl = await generateAiImage(prompt, selectedRatio);
                    if (!imageUrl) throw new Error('No image returned');

                    renderResult(imageUrl, prompt, railEl);
                    showToast('Image generated!', 'success');
                } catch (e) {
                    showToast(e.message, 'error');
                    railEl.innerHTML = renderEmptyState('images');
                } finally {
                    generateBtn.disabled = false;
                    generateBtn.classList.remove('btn-loading');
                }
            };
        },
        renderRail: (railEl) => {
            railEl.innerHTML = renderEmptyState('images');
        }
    });

    function renderResult(url, prompt, railEl) {
        railEl.innerHTML = `
        <div class="card" style="padding:0; overflow:hidden;">
            <img src="${url}" style="width:100%; display:block; background:var(--bg-secondary);" id="final-image" />
            <div style="padding: 24px; border-top: 1px solid var(--border-color);">
                <p style="font-size:0.95rem; color:var(--text-tertiary); margin-bottom:24px; font-style:italic;">"${escapeHtml(prompt)}"</p>
                <div style="display:flex; gap:12px;">
                    <a href="${url}" download="crealix-ai-image.png" target="_blank" class="btn btn-primary" style="flex:1; text-align:center;">Download HD</a>
                    <button class="btn btn-secondary" id="save-img-cloud">Save to Cloud</button>
                </div>
            </div>
        </div>`;

        const saveBtn = railEl.querySelector('#save-img-cloud');
        saveBtn.onclick = async () => {
            if (!auth.currentUser) return showToast('Please login to save to cloud', 'info');
            
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            
            try {
                await saveItemToCloud(auth.currentUser.uid, 'images', { url, prompt, ratio: selectedRatio });
                showToast('Saved to cloud!', 'success');
            } catch (e) {
                showToast('Failed to save', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save to Cloud';
            }
        };
    }
}
