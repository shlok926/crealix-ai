export function renderEmptyState(type) {
    return `
    <div class="card" style="padding: 24px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--text-tertiary);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; opacity: 0.5;"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
        <p style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; color:var(--text-secondary); margin-bottom:8px;">Ready to generate</p>
        <p style="font-size:0.85rem;">Your ${type} will appear here.</p>
    </div>`;
}

export function renderLoadingState() {
    return `
    <div class="card" style="padding: 24px; height: 100%;">
        <h3 style="font-family:'Space Grotesk', sans-serif; font-size:1.1rem; margin-bottom: 24px;">Generating...</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
            ${Array(3).fill('').map(() => `
            <div>
                <div class="skeleton skeleton-line" style="width:40%; margin-bottom:12px;"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line" style="width:70%"></div>
            </div>`).join('')}
        </div>
    </div>`;
}
