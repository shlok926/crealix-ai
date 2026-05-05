// ==================== Reel Script Generator Page ====================
import { generateReelScript } from '../services/ai.js';
import { showToast } from '../components/toast.js';
import { copyToClipboard } from '../utils/copy.js';
import { saveScript } from '../utils/storage.js';

export function renderReelScript(container) {
    container.innerHTML = `
    <div class="page page-fade">
        <div class="generator-header">
            <h1 class="creator-dash-title">🎬 Reel Script Generator</h1>
            <p class="creator-dash-sub">Turn any topic into a high-retention viral script.</p>
        </div>

        <div class="card generator-card mt-xl">
            <div class="form-group">
                <label class="form-label">What is your Reel about?</label>
                <textarea id="reel-topic" class="form-input" placeholder="e.g. 5 tips to scale your SaaS business in 2024" style="height:100px"></textarea>
            </div>

            <div class="generator-options-grid">
                <div class="form-group">
                    <label class="form-label">Niche / Industry</label>
                    <input type="text" id="reel-niche" class="form-input" placeholder="e.g. Marketing, Fitness">
                </div>
                <div class="form-group">
                    <label class="form-label">Tone</label>
                    <select id="reel-tone" class="form-input">
                        <option value="Professional">Professional</option>
                        <option value="Casual">Casual</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Educational">Educational</option>
                        <option value="Funny">Funny</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Duration</label>
                    <select id="reel-duration" class="form-input">
                        <option value="15s">15 Seconds</option>
                        <option value="30s" selected>30 Seconds</option>
                        <option value="60s">60 Seconds</option>
                    </select>
                </div>
            </div>

            <button class="btn btn-primary mt-xl w-full" id="generate-reel-btn">
                <span class="btn-text">Generate Script ✨</span>
            </button>
        </div>

        <div id="reel-result-area" class="mt-2xl" style="display:none">
            <!-- Results injected here -->
        </div>
    </div>`;

    const btn = document.getElementById('generate-reel-btn');
    btn.addEventListener('click', async () => {
        const topic = document.getElementById('reel-topic').value.trim();
        const niche = document.getElementById('reel-niche').value.trim();
        const tone = document.getElementById('reel-tone').value;
        const duration = document.getElementById('reel-duration').value;

        if (!topic) return showToast('Please enter a topic', 'error');

        btn.classList.add('btn-loading');
        btn.disabled = true;

        try {
            const script = await generateReelScript(topic, niche, tone, duration);
            renderResult(script);
        } catch (err) {
            showToast(err.message === 'API_KEY_MISSING' ? 'Please add your API key in settings' : 'Generation failed', 'error');
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    });

    function renderResult(script) {
        const area = document.getElementById('reel-result-area');
        area.style.display = 'block';
        area.innerHTML = `
            <div class="card result-card">
                <div class="result-header">
                    <span class="badge badge-purple">AI Generated Script</span>
                    <div style="display:flex; gap:8px">
                        <button class="btn btn-sm btn-secondary" id="save-script-btn">💾 Save to Favorites</button>
                        <button class="btn btn-sm btn-ghost" id="copy-script-btn">📋 Copy All</button>
                    </div>
                </div>
                
                <div class="script-section mt-lg">
                    <div class="script-label">🪝 THE HOOK</div>
                    <div class="script-text-box">${script.hook}</div>
                </div>

                ${script.scenes.map((s, i) => `
                <div class="script-section mt-lg">
                    <div class="script-label">🎬 SCENE ${i+1}</div>
                    <div class="script-meta"><strong>Visual:</strong> ${s.visual}</div>
                    <div class="script-text-box mt-sm"><strong>Audio:</strong> ${s.audio}</div>
                </div>`).join('')}

                <div class="script-section mt-lg">
                    <div class="script-label">🎯 CALL TO ACTION</div>
                    <div class="script-text-box">${script.cta}</div>
                </div>
            </div>
        `;

        document.getElementById('save-script-btn').addEventListener('click', () => {
            saveScript(script);
            showToast('Script saved to favorites! 🎬', 'success');
        });

        document.getElementById('copy-script-btn').addEventListener('click', () => {
            const fullText = `HOOO: ${script.hook}\n\nSCENE 1:\nVisual: ${script.scenes[0].visual}\nAudio: ${script.scenes[0].audio}\n\nSCENE 2:\nVisual: ${script.scenes[1].visual}\nAudio: ${script.scenes[1].audio}\n\nCTA: ${script.cta}`;
            copyToClipboard(fullText);
            showToast('Full script copied! 🎬', 'success');
        });

        area.scrollIntoView({ behavior: 'smooth' });
    }
}
