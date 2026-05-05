// ==================== Hero Landing Page ====================
// Full marketing/SEO landing page at route #/
// Sections: Hero → Stats → Features → How It Works → Tools → CTA

export function renderHome(container) {
    container.innerHTML = `
    <div class="landing-page">

        <!-- ── TOP NAV ────────────────────────────────────── -->
        <nav class="lp-top-nav" style="display:flex; justify-content:space-between; align-items:center; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%;">
            <div class="lp-nav-brand" style="display:flex; align-items:center; gap: 8px; font-weight:700; font-size:1.2rem; color:var(--text-primary)">
                <div class="sidebar-logo-icon" style="width:32px;height:32px;font-size:16px">✦</div>
                Crealix AI
            </div>
            <div class="lp-nav-links" style="display:flex; align-items:center; gap: 24px; font-size: 14px;">
                <a href="#/generator" style="color:var(--text-secondary); text-decoration:none; font-weight:500;">Bio Generator</a>
                <a href="#/username" style="color:var(--text-secondary); text-decoration:none; font-weight:500;">Username Finder</a>
                <a href="#/smart-hashtags" style="color:var(--text-secondary); text-decoration:none; font-weight:500;">Smart Hashtags</a>
                <button id="lp-theme-toggle" class="btn-icon" style="background:var(--bg-glass); border:1px solid var(--border-subtle); color:var(--text-primary); cursor:pointer; width:36px; height:36px; border-radius:50%; font-size:16px; display:flex; align-items:center; justify-content:center;" title="Toggle Theme">
                    ${localStorage.getItem('biospark_theme') === 'light' ? '🌙' : '☀️'}
                </button>
                <a href="#/dashboard" style="color:var(--text-primary); text-decoration:none; font-weight:600; margin-left: 12px;">Launch Dashboard</a>
                <a href="#/login" class="btn btn-primary" style="padding: 8px 16px; font-size: 14px;">Sign In</a>
            </div>
        </nav>

        <!-- ── HERO ─────────────────────────────────────── -->
        <section class="lp-hero" aria-label="Hero">
            <div class="lp-hero-badge">
                <span class="badge-dot"></span>
                100% Free · Open Source
            </div>
            <h1 class="lp-hero-title">
                The Smartest Way to<br/>
                <span class="lp-gradient-text">Grow on Instagram</span>
            </h1>
            <p class="lp-hero-sub">
                Generate stunning bios, viral captions, smart hashtags, hooks & username ideas —
                all powered by AI, <strong>completely free and unlimited</strong> for everyone.
            </p>
            <div class="lp-hero-actions">
                <a href="#/generator" class="btn btn-primary lp-btn-hero">
                    ✨ Generate My Bio — Free
                </a>
                <a href="#/captions" class="btn btn-secondary lp-btn-ghost">
                    ✍️ Try Caption Studio
                </a>
            </div>
            <p class="lp-hero-note">No credit card · Unlimited generations · Open Source</p>

            <!-- Floating preview card decoration -->
            <div class="lp-preview-deco" aria-hidden="true">
                <div class="lp-deco-card">
                    <div class="lp-deco-avatar"></div>
                    <div class="lp-deco-lines">
                        <div class="lp-deco-line lp-deco-line-name"></div>
                        <div class="lp-deco-line"></div>
                        <div class="lp-deco-line lp-deco-line-short"></div>
                    </div>
                </div>
                <div class="lp-deco-tag lp-deco-tag-1">🌸 Aesthetic</div>
                <div class="lp-deco-tag lp-deco-tag-2">#travel 🌍</div>
                <div class="lp-deco-tag lp-deco-tag-3">✨ Gen-Z</div>
            </div>
        </section>

        <!-- ── STATS ─────────────────────────────────────── -->
        <section class="lp-stats" aria-label="Stats">
            <div class="lp-stats-grid">
                <div class="lp-stat">
                    <span class="lp-stat-val">10+</span>
                    <span class="lp-stat-label">AI Tools</span>
                </div>
                <div class="lp-stat-divider"></div>
                <div class="lp-stat">
                    <span class="lp-stat-val">∞</span>
                    <span class="lp-stat-label">Generations</span>
                </div>
                <div class="lp-stat-divider"></div>
                <div class="lp-stat">
                    <span class="lp-stat-val">10</span>
                    <span class="lp-stat-label">Niches</span>
                </div>
                <div class="lp-stat-divider"></div>
                <div class="lp-stat">
                    <span class="lp-stat-val">100%</span>
                    <span class="lp-stat-label">Open Source</span>
                </div>
            </div>
        </section>

        <!-- ── FEATURES SHOWCASE ──────────────────────────── -->
        <section class="lp-section" aria-label="Features">
            <div class="lp-section-head">
                <span class="lp-section-tag">Everything Unlocked</span>
                <h2 class="lp-section-title">One toolkit for your entire <span class="lp-gradient-text">Instagram presence</span></h2>
                <p class="lp-section-sub">Stop switching between 10 different tools. Crealix AI does it all in one place — for free.</p>
            </div>

            <div class="lp-features-grid">
                ${[
                    {
                        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, color: 'purple', label: 'NEW',
                        title: 'AI Image Studio',
                        desc: 'Generate viral Instagram post images with Flux AI. Turn simple ideas into professional photography with our built-in Prompt Enhancer.',
                        href: '#/image-gen', cta: 'Generate Art →'
                    },
                    {
                        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`, color: 'blue', label: 'NEW',
                        title: 'AI Vision Studio',
                        desc: 'Upload any photo and let AI write the caption, hook, and hashtags for you. Multimodal analysis tailored for high engagement.',
                        href: '#/vision', cta: 'Analyze Photo →'
                    },
                    {
                        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, color: 'green', label: 'UPGRADED',
                        title: 'Profile Audit 2.0',
                        desc: 'Get a deep strategic scan of your profile health, a 30-day growth roadmap, and a personalized brand strategy report.',
                        href: '#/audit', cta: 'Deep Scan →'
                    },
                    {
                        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`, color: 'purple', label: 'FREE',
                        title: 'AI Bio Generator',
                        desc: 'Generate unique bios in seconds. Choose from 8 tones, 10 niches, and 5 formats. Preview exactly how it looks on Instagram.',
                        href: '#/generator', cta: 'Generate Bio →'
                    },
                    {
                        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`, color: 'blue', label: 'FREE',
                        title: 'Smart Hashtag Generator',
                        desc: 'AI analyzes your content and generates trending, niche-specific hashtags organized by reach — mega, macro, and micro.',
                        href: '#/smart-hashtags', cta: 'Get Hashtags →'
                    },
                    {
                        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, color: 'pink', label: 'FREE',
                        title: 'Caption Studio',
                        desc: 'Generate viral captions with hook + body + CTA structure. Or paste an existing caption and get an AI-optimized version.',
                        href: '#/captions', cta: 'Write Caption →'
                    },
                    {
                        icon: '🔥', color: 'orange', label: 'FREE',
                        title: 'Hook Generator',
                        desc: 'Generate 5 scroll-stopping opening lines for your posts and Reels. Pick your tone — controversial, curiosity, story, or bold.',
                        href: '#/hooks', cta: 'Generate Hooks →'
                    },
                    {
                        icon: '🔍', color: 'purple', label: 'FREE',
                        title: 'Username Finder',
                        desc: 'Generate creative, memorable username ideas based on your name, brand, or keywords. Stand out with the perfect handle.',
                        href: '#/username', cta: 'Find Username →'
                    }
                ].map(f => `
                <a href="${f.href}" class="lp-feature-card lp-feature-${f.color}" style="text-decoration:none">
                    <div class="lp-feature-top">
                        <div class="lp-feature-icon-wrap">${f.icon}</div>
                        <span class="lp-feature-label lp-label-${f.color}">${f.label}</span>
                    </div>
                    <h3 class="lp-feature-title">${f.title}</h3>
                    <p class="lp-feature-desc">${f.desc}</p>
                    <span class="lp-feature-cta">${f.cta}</span>
                </a>`).join('')}
            </div>
        </section>

        <!-- ── HOW IT WORKS ───────────────────────────────── -->
        <section class="lp-section lp-section-dark" aria-label="How it works">
            <div class="lp-section-head">
                <span class="lp-section-tag">Simple Process</span>
                <h2 class="lp-section-title">From blank page to <span class="lp-gradient-text">perfect bio</span> in 30 seconds</h2>
            </div>
            <div class="lp-steps-grid">
                <div class="lp-step">
                    <div class="lp-step-num">01</div>
                    <div class="lp-step-icon">✏️</div>
                    <h3 class="lp-step-title">Describe Yourself</h3>
                    <p class="lp-step-desc">Tell Crealix a bit about you or your brand — your niche, personality, or what you do.</p>
                </div>
                <div class="lp-step-arrow">→</div>
                <div class="lp-step">
                    <div class="lp-step-num">02</div>
                    <div class="lp-step-icon">🎨</div>
                    <h3 class="lp-step-title">Pick Your Vibe</h3>
                    <p class="lp-step-desc">Choose from 8 tones (aesthetic, funny, Gen-Z…), 10 niches, and 5 formats with a single click.</p>
                </div>
                <div class="lp-step-arrow">→</div>
                <div class="lp-step">
                    <div class="lp-step-num">03</div>
                    <div class="lp-step-icon">🚀</div>
                    <h3 class="lp-step-title">Copy & Shine</h3>
                    <p class="lp-step-desc">Preview your bio with the Instagram card, copy it, and update your profile in seconds.</p>
                </div>
            </div>
        </section>

        <!-- ── WHY BIOSPARK ───────────────────────────────── -->
        <section class="lp-section" aria-label="Why Crealix">
            <div class="lp-section-head">
                <span class="lp-section-tag">Why Crealix AI?</span>
                <h2 class="lp-section-title">Built <span class="lp-gradient-text">specifically</span> for Instagram creators</h2>
                <p class="lp-section-sub">Generic AI tools write generic bios. Crealix is laser-focused on what works on Instagram.</p>
            </div>
            <div class="lp-why-grid">
                ${[
                    { icon: '🎯', title: 'Instagram-First', desc: 'Every feature is built around Instagram best practices — 150 char limit, hashtag strategy, algorithm-friendly hooks.' },
                    { icon: '⚡', title: 'Instant Results', desc: 'No waiting. AI generates 3 unique bio options in under 5 seconds, ready to preview and copy.' },
                    { icon: '🎨', title: 'Deep Customization', desc: '8 tones × 10 niches × 5 formats = 400+ unique combinations. Your bio, your personality.' },
                    { icon: '💾', title: 'Save Everything', desc: 'Save your favourite bios, captions, hashtag sets, and usernames. Access them anytime.' },
                    { icon: '📵', title: 'Works Offline', desc: 'Your last generated content is cached locally. View it even without an internet connection.' },
                    { icon: '🌍', title: '100% Open Source', desc: 'This platform is built for the community. Use it, contribute to it, or host it yourself. Completely free.' }
                ].map(w => `
                <div class="lp-why-card card">
                    <span class="lp-why-icon">${w.icon}</span>
                    <h3 class="lp-why-title">${w.title}</h3>
                    <p class="lp-why-desc">${w.desc}</p>
                </div>`).join('')}
            </div>
        </section>

        <!-- ── OPEN SOURCE BANNER ──────────────────────────── -->
        <section class="lp-section lp-section-dark" aria-label="Open Source" id="pricing">
            <div class="lp-section-head">
                <span class="lp-section-tag">Community Driven</span>
                <h2 class="lp-section-title">Always Free. <span class="lp-gradient-text">Always Open Source.</span></h2>
                <p class="lp-section-sub">Crealix AI is a 100% free project. No tiers, no hidden costs, no credits needed.</p>
            </div>
            <div class="lp-hero-actions" style="justify-content:center;margin-top:var(--space-xl)">
                <a href="#/generator" class="btn btn-primary lp-btn-hero">
                    🚀 Launch Dashboard — It's Free
                </a>
            </div>
        </section>

        <!-- ── FINAL CTA ──────────────────────────────────── -->
        <section class="lp-cta-section" aria-label="Call to action">
            <div class="lp-cta-glow"></div>
            <span class="lp-section-tag">Get Started Now</span>
            <h2 class="lp-cta-title">Your perfect Instagram bio is<br/><span class="lp-gradient-text">one click away</span></h2>
            <p class="lp-cta-sub">Join thousands of creators and brands using Crealix AI to stand out on Instagram.</p>
            <div class="lp-hero-actions" style="justify-content:center;margin-top:var(--space-xl)">
                <a href="#/generator" class="btn btn-primary lp-btn-hero">
                    ✨ Start Generating Now
                </a>
            </div>
            <div class="lp-trust-row">
                <span>✓ Free forever</span>
                <span>✓ No credit card</span>
                <span>✓ Works instantly</span>
                <span>✓ No watermarks</span>
            </div>
        </section>

        <!-- ── FOOTER ─────────────────────────────────────── -->
        <footer class="lp-footer">
            <div class="lp-footer-brand">
                <div class="sidebar-logo-icon" style="width:28px;height:28px;font-size:13px">✦</div>
                <span class="sidebar-logo-text" style="font-size:var(--fs-md)">Crealix AI</span>
            </div>
            <p class="lp-footer-copy">© ${new Date().getFullYear()} Crealix AI · AI-powered Instagram tools · Built for creators</p>
            <div class="lp-footer-links">
                <a href="#/generator">Bio Generator</a>
                <a href="#/captions">Caption Studio</a>
                <a href="#/smart-hashtags">Hashtags</a>
                <a href="#/audit">Profile Audit</a>
                <a href="#/hooks">Hooks</a>
                <a href="#/dashboard">Dashboard</a>
            </div>
        </footer>

    </div>`;

    // Animate stat counters on scroll
    animateStats();

    // Initialize Theme Toggle Logic
    const themeBtn = container.querySelector('#lp-theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const current = localStorage.getItem('biospark_theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem('biospark_theme', next);
            document.documentElement.setAttribute('data-theme', next);
            themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
        };
    }
}

function animateStats() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('lp-stat-animate');
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.lp-stat').forEach(el => observer.observe(el));
}
