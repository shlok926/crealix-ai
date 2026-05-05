// ==================== Navbar Component ====================
import { createThemeToggle } from './themeToggle.js';
import { openSettingsModal } from './modal.js';

export function renderNavbar(currentRoute) {
    const navbar = document.getElementById('navbar');

    const links = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/generator', label: 'Bio Generator', icon: '✨' },
        { path: '/username', label: 'Usernames', icon: '🔍' },
        { path: '/templates', label: 'Templates', icon: '📋' },
        { path: '/saved', label: 'Saved', icon: '💾' }
    ];

    const navLinksHtml = links.map(link => {
        const isActive = currentRoute === link.path ? 'active' : '';
        return `<li><a href="#${link.path}" class="${isActive}" data-route="${link.path}">${link.icon} ${link.label}</a></li>`;
    }).join('');

    navbar.className = 'navbar';
    navbar.innerHTML = `
    <div class="navbar-inner">
      <a class="navbar-logo" href="#/" data-route="/">
        <div class="navbar-logo-icon">✦</div>
        <span class="navbar-logo-text">Crealix AI</span>
      </a>
      <ul class="navbar-links" id="nav-links">
        ${navLinksHtml}
      </ul>
      <div class="navbar-actions">
        <button class="btn-icon" id="settings-btn" aria-label="Settings">⚙️</button>
        <div id="theme-toggle-mount"></div>
        <button class="navbar-hamburger" id="hamburger-btn" aria-label="Menu">☰</button>
      </div>
    </div>
  `;

    // Mount theme toggle
    const toggleMount = document.getElementById('theme-toggle-mount');
    toggleMount.appendChild(createThemeToggle());

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);

    // Hamburger menu
    document.getElementById('hamburger-btn').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('open');
    });

    // Close mobile menu on link click
    navbar.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('nav-links').classList.remove('open');
        });
    });
}
