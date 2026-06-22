export function renderHelperHint(text) {
    return `
    <div style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:var(--text-tertiary); margin-top:8px;">
        <span class="hint-pill" style="display:inline-block; margin-right:6px;">💡</span> ${text}
    </div>`;
}
