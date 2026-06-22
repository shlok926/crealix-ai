export function renderPillGroup(options, selectedValue, onSelect) {
    // Generate an ID for the container so we can attach events if needed,
    // but the best way is to return an HTML string and let the parent attach a delegated event listener.
    return `
    <div class="chip-group-wrap">
        ${options.map(opt => `
            <button class="gen-chip ${selectedValue === opt.id ? 'selected' : ''}" data-value="${opt.id}">
                ${opt.icon ? opt.icon : ''} ${opt.label}
            </button>
        `).join('')}
    </div>`;
}

export function handlePillGroupClick(e, currentSelected, onSelect) {
    const c = e.target.closest('.gen-chip');
    if (!c) return;
    const value = c.dataset.value;
    if (value === currentSelected) return; // already selected
    
    // Parent container
    const container = c.closest('.chip-group-wrap');
    container.querySelectorAll('.gen-chip').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    
    if (onSelect) onSelect(value);
}
