// ==================== Instagram Preview Component ====================

export function renderPreview(container, { bio = '', username = '' } = {}) {
    const displayBio = bio || 'Your generated bio will appear here...';
    const displayUser = username || 'yourname';
    const isPlaceholder = !bio;

    container.innerHTML = `
    <div class="ig-preview-card">
      <div class="ig-preview-header">📱 Profile Preview</div>
      <div class="ig-preview-avatar-ring">
        <div class="ig-preview-avatar-ring-inner">👤</div>
      </div>
      <div class="ig-preview-username">@${displayUser}</div>
      <div class="ig-preview-stats">
        <div class="ig-preview-stat">
          <div class="ig-preview-stat-num">128</div>
          <div class="ig-preview-stat-label">Posts</div>
        </div>
        <div class="ig-preview-stat">
          <div class="ig-preview-stat-num">2.4K</div>
          <div class="ig-preview-stat-label">Followers</div>
        </div>
        <div class="ig-preview-stat">
          <div class="ig-preview-stat-num">486</div>
          <div class="ig-preview-stat-label">Following</div>
        </div>
      </div>
      <div class="ig-preview-bio ${isPlaceholder ? 'placeholder' : ''}">${displayBio}</div>
    </div>
  `;
}
