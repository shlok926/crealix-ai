// ==================== Bio Templates Page ====================
import { copyToClipboard } from '../utils/copy.js';
import { saveBio } from '../utils/storage.js';
import { showToast } from '../components/toast.js';

const TEMPLATES = [
    // Fitness
    {
        niche: 'Fitness', emoji: '💪', bios: [
            '💪 Lifting heavy, living light\n🏋️ Personal Trainer | Online Coach\n📩 DM for custom plans',
            '🔥 Sweat today, shine tomorrow\n🥗 Clean eating | Meal prep queen\n⬇️ Free workout guide below',
            '🏃 Running on caffeine & dreams\n💪 Fitness is a lifestyle, not a phase\n📍 Your city gym'
        ]
    },
    // Travel
    {
        niche: 'Travel', emoji: '✈️', bios: [
            '✈️ Collecting passport stamps\n🌍 30 countries & counting\n📸 Travel photographer',
            '🗺️ Not all who wander are lost\n☕ Fueled by coffee & wanderlust\n📍 Currently: somewhere beautiful',
            '🌴 Living my best island life\n✈️ Full-time traveler | Part-time dreamer\n⬇️ Travel tips & guides'
        ]
    },
    // Food
    {
        niche: 'Food', emoji: '🍕', bios: [
            '🍕 Eating my way through life\n👨‍🍳 Home cook | Recipe developer\n📸 Food is my love language',
            '🧁 Baker by passion\n🎂 Custom cakes & treats\n📩 Orders open | DM me',
            '🍜 If it\'s food, I\'m interested\n📍 NYC food explorer\n⬇️ Restaurant recs below'
        ]
    },
    // Tech
    {
        niche: 'Tech', emoji: '💻', bios: [
            '💻 Building the future, one line at a time\n🚀 Full Stack Dev | Open Source\n🔗 Portfolio below',
            '🤖 AI enthusiast | Tech geek\n📱 App developer by day\n🎮 Gamer by night',
            '⚡ Code. Coffee. Create. Repeat.\n💡 Turning ideas into apps\n📧 Open for freelance'
        ]
    },
    // Fashion
    {
        niche: 'Fashion', emoji: '👗', bios: [
            '👗 Style is a way to say who you are\n🛍️ Fashion blogger | Outfit inspo\n📩 Collabs welcome',
            '✨ Serving looks, not tea\n💅 Fashion | Beauty | Lifestyle\n⬇️ Shop my closet',
            '🖤 Minimal wardrobe, maximum style\n👔 Sustainable fashion advocate\n📍 Paris | Milan | NYC'
        ]
    },
    // Art
    {
        niche: 'Art', emoji: '🎨', bios: [
            '🎨 Making the world more colorful\n🖼️ Digital artist | Illustrator\n🛒 Prints available below',
            '✏️ Drawing my way through life\n🎭 Commissions: OPEN\n📩 DM for custom artwork',
            '🌈 Art is not what you see, it\'s what you make others see\n🎨 Mixed media artist\n📍 Studio life'
        ]
    },
    // Music
    {
        niche: 'Music', emoji: '🎵', bios: [
            '🎵 Making noise that matters\n🎸 Singer/Songwriter\n🎧 New single out now ⬇️',
            '🎹 Music is my therapy\n🎤 Live performer | Studio rat\n📍 On tour somewhere',
            '🎶 Born to make music\n🎧 Producer | Beat maker\n📩 Booking & collabs: DM'
        ]
    },
    // Business
    {
        niche: 'Business', emoji: '📈', bios: [
            '📈 Building empires, not excuses\n💼 CEO @ YourBrand\n🔗 Business inquiries below',
            '🚀 Entrepreneur | Growth strategist\n💡 Helping brands scale 10x\n📩 Let\'s connect',
            '💰 Making money moves\n📊 Digital marketing expert\n⬇️ Free business tips'
        ]
    },
    // Photography
    {
        niche: 'Photography', emoji: '📸', bios: [
            '📸 Capturing moments, creating memories\n🌅 Landscape & portrait photographer\n📩 Bookings open',
            '📷 Life through my lens\n🎞️ Film + Digital\n📍 Available for shoots worldwide',
            '✨ Finding beauty in the ordinary\n📸 Visual storyteller\n⬇️ Portfolio & pricing below'
        ]
    }
];

let activeNiche = 'all';

export function renderTemplates(container) {
    container.innerHTML = `
    <div class="page">
      <h1 class="section-title">📋 Bio Templates</h1>
      <p class="section-subtitle">Pre-made bio templates organized by niche. Click to copy or customize.</p>

      <div class="templates-categories">
        <button class="chip ${activeNiche === 'all' ? 'selected' : ''}" data-filter="all">
          <span class="chip-emoji">🌟</span> All
        </button>
        ${TEMPLATES.map(t => `
          <button class="chip ${activeNiche === t.niche ? 'selected' : ''}" data-filter="${t.niche}">
            <span class="chip-emoji">${t.emoji}</span> ${t.niche}
          </button>
        `).join('')}
      </div>

      <div class="template-grid" id="template-grid">
        ${renderTemplateCards()}
      </div>
    </div>
  `;

    // Filter chip events
    container.querySelectorAll('[data-filter]').forEach(chip => {
        chip.addEventListener('click', () => {
            activeNiche = chip.dataset.filter;
            container.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            document.getElementById('template-grid').innerHTML = renderTemplateCards();
            bindTemplateActions();
        });
    });

    bindTemplateActions();
}

function renderTemplateCards() {
    const filtered = activeNiche === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.niche === activeNiche);

    return filtered.map(category =>
        category.bios.map(bio => `
      <div class="card template-card">
        <div class="template-card-niche">${category.emoji} ${category.niche}</div>
        <div class="template-bio-text">${escapeHtml(bio)}</div>
        <div class="result-actions">
          <button class="btn btn-sm btn-secondary" data-action="copy" data-bio="${escapeAttr(bio)}">
            📋 Copy
          </button>
          <button class="btn btn-sm btn-ghost" data-action="save" data-bio="${escapeAttr(bio)}">
            💾 Save
          </button>
        </div>
      </div>
    `).join('')
    ).join('');
}

function bindTemplateActions() {
    document.querySelectorAll('.template-card [data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const bio = btn.dataset.bio;
            if (btn.dataset.action === 'copy') {
                copyToClipboard(bio);
            } else if (btn.dataset.action === 'save') {
                saveBio(bio);
                showToast('Template saved to favorites!', 'success');
            }
        });
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
}
