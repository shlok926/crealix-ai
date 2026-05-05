// ==================== Bulk Content Generator Page ====================
import { getClients } from '../services/clients.js';
import { generateBulkItems } from '../services/ai.js';
import { showToast } from '../components/toast.js';
import { copyToClipboard } from '../utils/copy.js';

export async function renderBulkGenerator(container) {
    let clients = [];
    try {
        clients = await getClients();
    } catch (e) {
        console.error('Failed to load clients', e);
    }

    container.innerHTML = `
    <div class="page page-narrow">
        <div class="section-header">
            <div>
                <h1 class="section-title">📦 Bulk Content Generator</h1>
                <p class="section-subtitle">Generate a month's worth of content (30+ items) in one click.</p>
            </div>
            <div class="badge badge-purple">STUDIO EXCLUSIVE</div>
        </div>

        <div class="card mt-xl">
            <div class="form-grid">
                <div class="input-group">
                    <label class="form-label">1. Select Client</label>
                    <select id="bulk-client" class="form-input">
                        ${clients.length ? 
                            clients.map(c => `<option value="${c.id}" data-niche="${c.niche}" data-tone="${c.tone}">${c.name} (${c.niche})</option>`).join('') :
                            '<option value="">No clients found. Add one in Studio Dashboard first.</option>'
                        }
                    </select>
                </div>

                <div class="input-group">
                    <label class="form-label">2. Content Type</label>
                    <div style="display:flex; gap:12px">
                        <label class="chip-radio">
                            <input type="radio" name="bulk-type" value="captions" checked>
                            <span>✍️ Captions</span>
                        </label>
                        <label class="chip-radio">
                            <input type="radio" name="bulk-type" value="bios">
                            <span>✨ Bios</span>
                        </label>
                    </div>
                </div>

                <div class="input-group">
                    <label class="form-label">3. Topic / Goal</label>
                    <textarea id="bulk-topic" class="form-input" placeholder="e.g. 5 tips for productivity, Morning routine, Product launch..." rows="2"></textarea>
                </div>

                <div class="input-group">
                    <label class="form-label">4. Quantity</label>
                    <div style="display:flex; align-items:center; gap:16px">
                        <input type="range" id="bulk-count" min="10" max="50" step="5" value="30" style="flex:1">
                        <span id="count-display" style="font-weight:700; color:var(--accent-purple); min-width:30px">30</span>
                    </div>
                </div>
            </div>

            <button id="generate-bulk-btn" class="btn btn-primary btn-block mt-xl" ${!clients.length ? 'disabled' : ''}>
                ✨ Start Bulk Generation
            </button>
        </div>

        <!-- Progress Overlay (Hidden by default) -->
        <div id="bulk-progress-area" style="display:none" class="card mt-xl">
            <div style="text-align:center">
                <div class="loading-spinner mb-md" style="margin: 0 auto"></div>
                <h3 id="progress-status">Generating Batch 1/6...</h3>
                <div class="progress-bar-container mt-md" style="height:8px; border-radius:4px; background:rgba(255,255,255,0.05); overflow:hidden">
                    <div id="progress-bar" style="width:0%; height:100%; background:var(--accent-purple); transition:width 0.3s ease"></div>
                </div>
                <p class="mt-sm" style="font-size:12px; color:var(--text-tertiary)">This may take up to 60 seconds. Please don't close the tab.</p>
            </div>
        </div>

        <!-- Results Area (Hidden by default) -->
        <div id="bulk-results-area" style="display:none" class="mt-xl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
                <h3 id="result-count">Generated 30 items</h3>
                <div style="display:flex; gap:8px">
                    <button class="btn btn-sm btn-secondary" id="export-csv-btn">📊 Export CSV</button>
                    <button class="btn btn-sm btn-ghost" id="copy-all-btn">📋 Copy All</button>
                </div>
            </div>
            <div class="results-grid" id="bulk-results-grid"></div>
        </div>
    </div>
    `;

    // --- Interactivity ---
    const countSlider = document.getElementById('bulk-count');
    const countDisplay = document.getElementById('count-display');
    countSlider.oninput = () => countDisplay.textContent = countSlider.value;

    const genBtn = document.getElementById('generate-bulk-btn');
    const progressArea = document.getElementById('bulk-progress-area');
    const resultsArea = document.getElementById('bulk-results-area');
    const resultsGrid = document.getElementById('bulk-results-grid');
    const progressBar = document.getElementById('progress-bar');
    const progressStatus = document.getElementById('progress-status');

    let generatedItems = [];

    genBtn.onclick = async () => {
        const clientSelect = document.getElementById('bulk-client');
        if (!clientSelect.value) return showToast('Please select a client', 'error');

        const type = document.querySelector('input[name="bulk-type"]:checked').value;
        const topic = document.getElementById('bulk-topic').value;
        const count = parseInt(countSlider.value);
        const selectedOpt = clientSelect.options[clientSelect.selectedIndex];
        const niche = selectedOpt.dataset.niche;
        const tone = selectedOpt.dataset.tone;

        if (!topic) return showToast('Please enter a topic or goal', 'error');

        // UI Reset
        generatedItems = [];
        resultsArea.style.display = 'none';
        progressArea.style.display = 'block';
        genBtn.disabled = true;
        progressBar.style.width = '0%';
        
        try {
            generatedItems = await generateBulkItems(type, topic, niche, tone, count, (pct) => {
                progressBar.style.width = `${pct}%`;
                progressStatus.textContent = `Generating ${type}... ${pct}%`;
            });

            renderResults(generatedItems, type);
            showToast(`Generated ${generatedItems.length} items successfully!`, 'success');
        } catch (e) {
            showToast('Generation failed. Please try again.', 'error');
            console.error(e);
        } finally {
            progressArea.style.display = 'none';
            genBtn.disabled = false;
        }
    };

    function renderResults(items, type) {
        resultsArea.style.display = 'block';
        document.getElementById('result-count').textContent = `Generated ${items.length} ${type}`;
        
        resultsGrid.innerHTML = items.map((item, i) => `
            <div class="card result-card animate-fade-in" style="animation-delay: ${i * 0.05}s">
                <div class="result-bio" style="white-space:pre-wrap; font-size:14px">${item}</div>
                <div class="result-actions mt-sm" style="border-top:1px solid var(--border-subtle); padding-top:8px">
                    <span style="font-size:11px; color:var(--text-tertiary)">#${i+1}</span>
                    <button class="btn-icon btn-copy-item" data-text="${item.replace(/"/g, '&quot;')}" title="Copy">📋</button>
                </div>
            </div>
        `).join('');

        resultsGrid.querySelectorAll('.btn-copy-item').forEach(btn => {
            btn.onclick = () => {
                copyToClipboard(btn.dataset.text);
                showToast('Copied!', 'success');
            };
        });
    }

    // Export & Copy All
    document.getElementById('copy-all-btn').onclick = () => {
        const fullText = generatedItems.map((it, i) => `[${i+1}]\n${it}`).join('\n\n---\n\n');
        copyToClipboard(fullText);
        showToast('All items copied to clipboard!', 'success');
    };

    document.getElementById('export-csv-btn').onclick = () => {
        const type = document.querySelector('input[name="bulk-type"]:checked').value;
        const csvContent = "data:text/csv;charset=utf-8,Index,Content\n" 
            + generatedItems.map((it, i) => `${i+1},"${it.replace(/"/g, '""')}"`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `crealix_bulk_${type}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV downloaded!', 'success');
    };
}
