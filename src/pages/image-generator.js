// ==================== AI Image Generator Page ====================
import { generateAiImage, enhanceImagePrompt } from '../services/imageAi.js';
import { showToast } from '../components/toast.js';
import { escapeHtml } from '../utils/helpers.js';
import { saveItemToCloud } from '../services/cloudStorage.js';
import { auth } from '../services/firebase.js';

export function renderImageGenerator(container) {
    container.innerHTML = `
    <div class="page page-narrow">
        <h1 class="section-title">AI Image Studio</h1>
        <p class="section-subtitle">Turn your ideas into viral Instagram posts with Flux AI</p>

        <div class="card">
            <div class="form-group">
                <label class="form-label">What do you want to create?</label>
                <div style="position:relative">
                    <textarea class="form-textarea" id="img-prompt" placeholder="e.g. A futuristic coffee shop in Bali with neon lights and jungle vibes..." style="min-height:120px"></textarea>
                    <button class="btn btn-sm btn-ghost" id="enhance-prompt-btn" style="position:absolute; bottom:12px; right:12px; font-size:12px;">
                        ✨ Enhance with AI
                    </button>
                </div>
            </div>

            <div class="form-group mt-lg">
                <label class="form-label">Aspect Ratio</label>
                <div class="chip-group" id="ratio-chips">
                    <button class="chip selected" data-ratio="1:1">⬜ Square (1:1)</button>
                    <button class="chip" data-ratio="4:5">📱 Portrait (4:5)</button>
                    <button class="chip" data-ratio="16:9">🖼️ Landscape (16:9)</button>
                </div>
            </div>

            <button class="btn btn-primary mt-xl" id="generate-img-btn" style="width:100%">
                Generate Masterpiece
            </button>
        </div>

        <div id="image-result-container" class="mt-2xl"></div>
    </div>`;

    const promptInput = container.querySelector('#img-prompt');
    const enhanceBtn = container.querySelector('#enhance-prompt-btn');
    const generateBtn = container.querySelector('#generate-img-btn');
    const ratioChips = container.querySelectorAll('#ratio-chips .chip');
    const resultContainer = container.querySelector('#image-result-container');

    let selectedRatio = '1:1';

    // Handle Chip Selection
    ratioChips.forEach(chip => {
        chip.onclick = () => {
            ratioChips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            selectedRatio = chip.dataset.ratio;
        };
    });

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
        generateBtn.innerHTML = '<span class="btn-loading"></span> Generating...';
        resultContainer.innerHTML = `
        <div class="card skeleton-card" style="height: 400px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px;">
            <div class="skeleton-premium" style="width:100%; height:100%; border-radius:var(--radius-lg)"></div>
            <p style="color:var(--text-secondary); font-size:14px;">Creating your image (usually takes 10-20s)...</p>
        </div>`;

        try {
            const imageUrl = await generateAiImage(prompt, selectedRatio);
            if (!imageUrl) throw new Error('No image returned');

            renderResult(imageUrl, prompt);
            showToast('Image generated!', 'success');
        } catch (e) {
            showToast(e.message, 'error');
            resultContainer.innerHTML = '';
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generate Masterpiece';
        }
    };

    function renderResult(url, prompt) {
        resultContainer.innerHTML = `
        <div class="card" style="padding:0; overflow:hidden;">
            <img src="${url}" style="width:100%; display:block; background:var(--bg-secondary);" id="final-image" />
            <div style="padding:var(--space-lg); border-top: 1px solid var(--border-subtle);">
                <p style="font-size:13px; color:var(--text-tertiary); margin-bottom:16px; font-style:italic;">"${escapeHtml(prompt)}"</p>
                <div style="display:flex; gap:12px;">
                    <a href="${url}" download="crealix-ai-image.png" target="_blank" class="btn btn-primary" style="flex:1">Download HD</a>
                    <button class="btn btn-secondary" id="save-img-cloud">Save to Cloud</button>
                </div>
            </div>
        </div>`;

        const saveBtn = resultContainer.querySelector('#save-img-cloud');
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
