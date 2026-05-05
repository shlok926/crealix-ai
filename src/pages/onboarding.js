// ==================== Onboarding — Getting Started ====================
// A simple welcome screen for new users explaining the platform

export function renderOnboarding(container) {
    container.innerHTML = `
    <div class="onboarding-wrapper">
        <div class="onboarding-header" style="text-align: center; margin-bottom: 40px;">
            <div class="sidebar-logo-icon" style="width:60px;height:60px;font-size:24px;margin:0 auto 20px">✦</div>
            <h1 class="onboarding-title">Welcome to <span class="lp-gradient-text">Crealix AI</span></h1>
            <p class="onboarding-sub" style="font-size: 1.1rem; color: var(--text-secondary);">Your journey to a better Instagram presence starts here.</p>
        </div>

        <div class="onboarding-steps" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; max-width: 1000px; margin: 0 auto;">
            <div class="card" style="padding: 30px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">✨</div>
                <h3 style="margin-bottom: 10px;">AI Bio Generator</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Create professional, aesthetic, or funny bios in seconds. Preview them as they appear on Instagram.</p>
            </div>
            <div class="card" style="padding: 30px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">✍️</div>
                <h3 style="margin-bottom: 10px;">Caption Studio</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Write engaging captions with AI. Optimize your hooks and call-to-actions effortlessly.</p>
            </div>
            <div class="card" style="padding: 30px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                <h3 style="margin-bottom: 10px;">Everything is Free</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Crealix is now 100% open source. Enjoy unlimited generations and all features with no limits.</p>
            </div>
        </div>

        <div style="text-align: center; margin-top: 50px;">
            <a href="#/dashboard" class="btn btn-primary" style="padding: 15px 40px; font-size: 1.1rem; border-radius: 50px;">
                Go to Dashboard →
            </a>
        </div>
    </div>`;
}
