// ==================== Story Ideas Generator Page ====================
import { generateStoryIdeas } from '../services/ai.js';
import { showToast } from '../components/toast.js';
import { saveStoryIdea } from '../utils/storage.js';

export function renderStoryIdeas(container) {
    container.innerHTML = `
    <div class="page page-fade">
        <div class="generator-header">
            <h1 class="creator-dash-title">📱 Story Ideas Generator</h1>
            <p class="creator-dash-sub">Keep your audience engaged with daily creative story concepts.</p>
        </div>

        <div class="card generator-card mt-xl">
            <div class="generator-options-grid">
                <div class="form-group">
                    <label class="form-label">Niche / Industry</label>
                    <input type="text" id="story-niche" class="form-input" placeholder="e.g. Lifestyle, Tech, Food">
                </div>
                <div class="form-group">
                    <label class="form-label">Goal</label>
                    <select id="story-goal" class="form-input">
                        <option value="Engagement">Engagement (Polls/Quiz)</option>
                        <option value="Educational">Educational (Tutorials/Tips)</option>
                        <option value="Promotion">Promotion (Sales/Launch)</option>
                        <option value="Personal">Personal (Behind the scenes)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Tone</label>
                    <select id="story-tone" class="form-input">
                        <option value="Casual">Casual</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Energetic">Energetic</option>
                    </select>
                </div>
            </div>

            <button class="btn btn-primary mt-xl w-full" id="generate-story-btn">
                <span class="btn-text">Generate Story Ideas 💡</span>
            </button>
        </div>

        <div id="story-result-area" class="mt-2xl" style="display:none">
            <!-- Results injected here -->
        </div>
    </div>`;

    const btn = document.getElementById('generate-story-btn');
    btn.addEventListener('click', async () => {
        const niche = document.getElementById('story-niche').value.trim();
        const goal = document.getElementById('story-goal').value;
        const tone = document.getElementById('story-tone').value;

        if (!niche) return showToast('Please enter your niche', 'error');

        btn.classList.add('btn-loading');
        btn.disabled = true;

        try {
            const ideas = await generateStoryIdeas(niche, goal, tone);
            renderResult(ideas);
        } catch (err) {
            showToast(err.message === 'API_KEY_MISSING' ? 'Please add your API key in settings' : 'Generation failed', 'error');
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    });

    function renderResult(ideas) {
        const area = document.getElementById('story-result-area');
        area.style.display = 'block';
        area.innerHTML = `
            <div class="story-ideas-container">
                <h3 style="margin-bottom:16px">💡 Suggested Story Slides</h3>
                ${ideas.map((idea, i) => `
                <div class="card story-idea-card mb-lg animate-fade-in" style="animation-delay: ${i * 0.1}s">
                    <div style="display:flex; justify-content:space-between">
                        <span class="badge badge-blue">Slide ${i+1}</span>
                        <button class="btn btn-icon btn-save-story" data-index="${i}" title="Save Idea" style="background:none; border:none; cursor:pointer; font-size:1.2rem">💾</button>
                    </div>
                    <div class="story-idea-title mt-sm" style="font-weight:700; color:var(--text-primary)">${idea.title}</div>
                    <div class="story-idea-content mt-sm" style="color:var(--text-secondary); font-size:var(--fs-sm); white-space:pre-wrap">${idea.content}</div>
                </div>`).join('')}
            </div>
        `;

        area.querySelectorAll('.btn-save-story').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.dataset.index;
                saveStoryIdea(ideas[idx]);
                showToast('Story idea saved! 📱', 'success');
                btn.innerText = '✅';
                btn.disabled = true;
            });
        });

        area.scrollIntoView({ behavior: 'smooth' });
    }
}
