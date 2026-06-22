// ==================== OpenRouter AI Service ====================
import { getApiKey } from '../utils/storage.js';

const MODEL = 'openrouter/free';

// ── Core fetch wrapper ─────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
    const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.9,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error('RATE_LIMITED');
        throw new Error(err.error?.message || `API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// ── Vision Support ─────────────────────────────────────────────
export async function analyzeImage(base64Image, userPrompt) {
    const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'google/gemini-flash-1.5', // Highly efficient for vision
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: userPrompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: base64Image // Must be data:image/jpeg;base64,...
                            }
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Vision API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// ── Bio Generation ─────────────────────────────────────────────
export async function generateBios(description, tone, niche, format = 'bullet') {
    const formatInstructions = {
        short: 'Structure: [Impactful Title] | [Key Skill] | [CTA]. Max 80 chars.',
        bullet: 'Structure MUST use bullet points: \\n• [Identity/Title]\\n• [What you do/Value]\\n• [Achievement/Credibility]\\n👇 [Call to Action]',
        emoji: 'Structure: [Emoji] [Identity] | [Emoji] [Value] | [Emoji] [CTA]. Use 4-6 emojis.',
        minimalist: 'lowercase only. structure: [who you are] • [what you build] • [where to find you]. strictly NO emojis.',
        cta: 'Structure: [Catchy hook] | [Your Expertise] \\n👇 [Strong Call to Action]'
    };
    const fmtHint = formatInstructions[format] || formatInstructions.bullet;

    const systemPrompt = `You are an elite Instagram Branding Expert. Generate EXACTLY 3 unique, professional Instagram bios.
CRITICAL RULES:
1. You MUST strictly follow this structure: ${fmtHint}
2. Tone must be strongly: ${tone}.
3. Tailor keywords for the niche: ${niche}.
4. Length: Strictly under 150 characters per bio.
5. Output format MUST be a numbered list (1. 2. 3.) on separate lines.
Do NOT output any explanations, conversational text, or quotes. Only the 3 bios.`;

    const userPrompt = `Convert these details into 3 Instagram bios:\n"${description}"`;

    const raw = await callAI(systemPrompt, userPrompt);
    return parseBios(raw);
}

// ── Username Generation ────────────────────────────────────────
export async function generateUsernames(keywords, style) {
    const raw = await callAI(
        'Generate exactly 10 Instagram username suggestions. Each on separate line numbered 1-10. Only letters, numbers, underscores, periods. 3-30 chars. No @ symbol. No explanation.',
        `Create 10 Instagram usernames for: "${keywords}"\nStyle: ${style}`
    );
    return parseUsernames(raw);
}

// ── Hashtag Generation ─────────────────────────────────────────
export async function generateHashtags(bioText) {
    const raw = await callAI(
        'You are a social media hashtag expert. Generate 10-15 relevant Instagram hashtags. Each starts with #. All on one line separated by spaces. No explanation.',
        `Generate hashtags for: "${bioText}"`
    );
    return parseHashtags(raw);
}

// ── Smart Hashtag Generation (categorized) ─────────────────────
export async function generateSmartHashtags(content, niche, type, audience = '', location = '') {
    const prompt = `Analyze this Instagram content and generate 20 optimized hashtags.
Description: "${content}"
Content Type: ${type}
Niche: ${niche}
Audience: ${audience || 'General'}
Location: ${location || 'None'}

Categorize into 4 groups (5 tags each):
[HR] #tag1 #tag2 ... (High Reach — popular)
[MR] #tag1 #tag2 ... (Medium Reach — targeted)
[NS] #tag1 #tag2 ... (Niche Specific)
[TS] #tag1 #tag2 ... (Trending Style)

Also generate a professional Instagram caption (70-150 words) with 2-3 emojis, an engaging hook and a call to action.
Format:
[CAPTION]
Your caption text
[/CAPTION]
[HR] ...
[MR] ...
[NS] ...
[TS] ...
No other text.`;

    const raw = await callAI('You are an Instagram Marketing & SEO expert. Generate high-engagement content.', prompt);
    const groups = { high: [], medium: [], niche: [], trending: [] };
    let caption = '';

    const capMatch = raw.match(/\[CAPTION\]([\s\S]*?)\[\/CAPTION\]/);
    if (capMatch) caption = capMatch[1].trim();

    const hashPart = raw.replace(/\[CAPTION\][\s\S]*?\[\/CAPTION\]/, '');
    const parts = hashPart.split(/\[(?:HR|MR|NS|TS)\]/).filter(p => p.trim());
    if (parts.length >= 4) {
        groups.high = parts[0].match(/#[\w]+/g) || [];
        groups.medium = parts[1].match(/#[\w]+/g) || [];
        groups.niche = parts[2].match(/#[\w]+/g) || [];
        groups.trending = parts[3].match(/#[\w]+/g) || [];
    } else {
        const all = raw.match(/#[\w]+/g) || [];
        groups.high = all.slice(0, 5);
        groups.medium = all.slice(5, 10);
        groups.niche = all.slice(10, 15);
        groups.trending = all.slice(15, 20);
    }
    return { groups, caption };
}

// ── Emoji Suggestions ──────────────────────────────────────────
export async function generateEmojis(bioText) {
    const raw = await callAI(
        'Suggest 8-12 emojis for an Instagram bio. Return ONLY emojis separated by spaces. No text.',
        `Suggest emojis for: "${bioText}"`
    );
    return raw.trim().split(/\s+/).filter(e => e.length <= 4);
}

// ── Profile Audit 2.0 ──────────────────────────────────────────
export async function generateDeepProfileAudit(username, bio, niche, goal, followers, frequency, style) {
    const raw = await callAI(
        `You are an Instagram Growth & Branding Consultant. Audit the provided profile and return a deep strategic analysis.
        
        Format your response EXACTLY as:
        [SCORE] 0-100
        [METRICS] Clarity:0-10, Appeal:0-10, CTA:0-10, SEO:0-10
        [STRENGTHS]
        - strength 1
        - strength 2
        [WEAKNESSES]
        - weakness 1
        - weakness 2
        [STRATEGY]
        A brief 2-3 sentence overview of the current brand positioning.
        [SUGGESTIONS]
        - actionable suggestion 1
        - actionable suggestion 2
        [ROADMAP]
        - Week 1: task
        - Week 2: task
        - Week 3: task
        - Week 4: task
        [REWRITTEN]
        A rewritten bio under 150 chars`,
        `Audit this Instagram profile:
        Username: @${username}
        Bio: "${bio}"
        Niche: ${niche}
        Goal: ${goal}
        Followers: ${followers || 'Unknown'}
        Posting Frequency: ${frequency}
        Primary Style: ${style}`
    );
    return parseDeepAudit(raw);
}

function parseDeepAudit(raw) {
    const get = (tag) => {
        const m = raw.match(new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`));
        return m ? m[1].trim() : '';
    };
    
    const metricsRaw = get('METRICS');
    const metrics = { clarity: 5, appeal: 5, cta: 5, seo: 5 };
    metricsRaw.split(',').forEach(m => {
        const [k, v] = m.split(':');
        if (k && v) metrics[k.trim().toLowerCase()] = parseInt(v) || 5;
    });

    const parseList = (tag) => get(tag).split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim());

    return {
        score: parseInt(get('SCORE')) || 50,
        metrics,
        strengths: parseList('STRENGTHS'),
        weaknesses: parseList('WEAKNESSES'),
        strategy: get('STRATEGY'),
        suggestions: parseList('SUGGESTIONS'),
        roadmap: parseList('ROADMAP'),
        rewritten: get('REWRITTEN')
    };
}

// ── Hook Generator ─────────────────────────────────────────────
export async function generateHooks(topic, audience, tone) {
    const raw = await callAI(
        `You are a viral content strategist. Generate 5 powerful Instagram caption hooks.
Rules:
- Each hook is 1-2 sentences, max 100 chars
- Numbered 1-5 on separate lines
- Use proven hook formulas: question, bold statement, stat, story, controversy
- Make them extremely attention-grabbing
- No explanation, just the hooks`,
        `Generate 5 Instagram hooks for:
Topic: "${topic}"
Audience: ${audience}
Tone: ${tone}`
    );
    return parseHooks(raw);
}

// ── Caption Generation ─────────────────────────────────────────
export async function generateCaption(content, type, tone, audience, goal) {
    const raw = await callAI(
        `You are an expert Instagram copywriter. Generate a complete, engaging Instagram caption.

Format EXACTLY as:
[HOOK]
One attention-grabbing opening line
[BODY]
Main caption body (2-4 sentences, conversational)
[CTA]
Call to action line
[HASHTAGS]
#tag1 #tag2 #tag3 (5-8 relevant hashtags)`,
        `Create an Instagram caption for:
Content: "${content}"
Type: ${type}
Tone: ${tone}
Audience: ${audience || 'General'}
Goal: ${goal || 'Engagement'}`
    );
    return parseCaption(raw);
}

// ── Reel Script Generator ─────────────────────────────────────
export async function generateReelScript(topic, niche, tone, duration = '30s') {
    const raw = await callAI(
        `You are a viral Instagram Reel scriptwriter. Generate a high-retention script.
Format EXACTLY as:
[HOOK]
1-2 punchy opening lines (visual + audio)
[SCENE1]
Visual: description
Audio: spoken lines
[SCENE2]
Visual: description
Audio: spoken lines
[CTA]
Final visual and call to action`,
        `Create a ${duration} Reel script for:
Topic: "${topic}"
Niche: ${niche}
Tone: ${tone}`
    );
    return parseReelScript(raw);
}

// ── Story Ideas Generator ─────────────────────────────────────
export async function generateStoryIdeas(niche, goal, tone) {
    const raw = await callAI(
        `You are an Instagram Story strategist. Generate 5 creative story slide ideas.
Each idea should include:
- Visual concept
- On-screen text
- Engagement sticker suggestion (Poll, Quiz, Slider, Question)
Format as numbered 1-5. No explanation.`,
        `Generate 5 Story ideas for:
Niche: ${niche}
Goal: ${goal}
Tone: ${tone}`
    );
    return parseStoryIdeas(raw);
}

// ── Caption Improver ───────────────────────────────────────────
export async function improveCaption(original, tone, goal) {
    const raw = await callAI(
        `You are an expert Instagram copywriter. Improve the given caption.
Format EXACTLY as:
[IMPROVED]
The improved caption (keep under 300 words)
[CHANGES]
- Change 1
- Change 2
- Change 3`,
        `Improve this Instagram caption:
"${original}"
Desired tone: ${tone}
Optimization goal: ${goal}`
    );
    return parseImprovedCaption(raw);
}

// ── Bulk Content Generation ────────────────────────────────────
export async function generateBulkItems(type, topic, niche, tone, count, onProgress) {
    const batchSize = type === 'bios' ? 10 : 5;
    const items = [];
    const totalBatches = Math.ceil(count / batchSize);

    for (let i = 0; i < totalBatches; i++) {
        const batchCount = Math.min(batchSize, count - items.length);
        const prompt = type === 'bios' 
            ? `Generate exactly ${batchCount} unique Instagram bios for niche: ${niche}, topic: ${topic}, tone: ${tone}. Format: numbered 1-${batchCount} on separate lines. No explanation.`
            : `Generate exactly ${batchCount} unique Instagram captions for niche: ${niche}, topic: ${topic}, tone: ${tone}. Format: [ITEM] caption text [/ITEM] for each. No explanation.`;
        
        try {
            const raw = await callAI(`You are a batch content creator.`, prompt);
            const batchItems = type === 'bios' ? parseBios(raw) : parseBulkCaptions(raw);
            items.push(...batchItems);
            
            if (onProgress) onProgress(Math.round(((i + 1) / totalBatches) * 100));
        } catch (e) {
            console.error('Batch generation error:', e);
            throw e;
        }
    }
    return items.slice(0, count);
}

function parseBulkCaptions(raw) {
    const matches = raw.match(/\[ITEM\]([\s\S]*?)\[\/ITEM\]/g) || [];
    return matches.map(m => m.replace(/\[\/?ITEM\]/g, '').trim()).filter(t => t.length > 10);
}

// ── Parse helpers ──────────────────────────────────────────────
function parseBios(raw) {
    const lines = raw.split('\n').filter(l => l.trim());
    const bios = [];
    for (const line of lines) {
        const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
        if (cleaned && cleaned.length > 5) bios.push(cleaned);
        if (bios.length >= 3) break;
    }
    return bios.length > 0 ? bios : [raw.trim()];
}

function parseUsernames(raw) {
    const lines = raw.split('\n').filter(l => l.trim());
    const unames = [];
    for (const line of lines) {
        const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').replace(/@/g, '').trim();
        if (cleaned && /^[a-zA-Z0-9_.]+$/.test(cleaned)) unames.push(cleaned);
        if (unames.length >= 10) break;
    }
    return unames;
}

function parseHashtags(raw) {
    const matches = raw.match(/#[\w]+/g) || [];
    return [...new Set(matches)].slice(0, 15);
}

function parseHooks(raw) {
    const lines = raw.split('\n').filter(l => l.trim());
    const hooks = [];
    for (const line of lines) {
        const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
        if (cleaned && cleaned.length > 5) hooks.push(cleaned);
        if (hooks.length >= 5) break;
    }
    return hooks;
}

function parseAudit(raw) {
    const get = (tag) => {
        const m = raw.match(new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`));
        return m ? m[1].trim() : '';
    };
    const score = parseInt(get('SCORE')) || 50;
    const clarity = parseInt(get('CLARITY')) || 5;
    const appeal = parseInt(get('APPEAL')) || 5;
    const cta = parseInt(get('CTA')) || 5;
    const keywords = parseInt(get('KEYWORDS')) || 5;
    const parseList = (tag) => get(tag).split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim());
    return {
        score, clarity, appeal, cta, keywords,
        strengths: parseList('STRENGTHS'),
        weaknesses: parseList('WEAKNESSES'),
        suggestions: parseList('SUGGESTIONS'),
        rewritten: get('REWRITTEN')
    };
}

function parseCaption(raw) {
    const get = (tag) => {
        const m = raw.match(new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`));
        return m ? m[1].trim() : '';
    };
    return {
        hook: get('HOOK'),
        body: get('BODY'),
        cta: get('CTA'),
        hashtags: (get('HASHTAGS').match(/#[\w]+/g) || []).slice(0, 8)
    };
}

function parseImprovedCaption(raw) {
    const get = (tag) => {
        const m = raw.match(new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`));
        return m ? m[1].trim() : '';
    };
    return {
        improved: get('IMPROVED'),
        changes: get('CHANGES').split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
    };
}

function parseReelScript(raw) {
    const get = (tag) => {
        const m = raw.match(new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`));
        return m ? m[1].trim() : '';
    };
    return {
        hook: get('HOOK'),
        scenes: [
            { visual: get('SCENE1').split('Audio:')[0].replace('Visual:', '').trim(), audio: get('SCENE1').split('Audio:')[1]?.trim() || '' },
            { visual: get('SCENE2').split('Audio:')[0].replace('Visual:', '').trim(), audio: get('SCENE2').split('Audio:')[1]?.trim() || '' }
        ],
        cta: get('CTA')
    };
}

function parseStoryIdeas(raw) {
    const lines = raw.split('\n').filter(l => l.trim());
    const ideas = [];
    let currentIdea = null;

    for (const line of lines) {
        if (/^\d+[\.\)\-]\s*/.test(line)) {
            if (currentIdea) ideas.push(currentIdea);
            currentIdea = { title: line.replace(/^\d+[\.\)\-]\s*/, '').trim(), content: '' };
        } else if (currentIdea) {
            currentIdea.content += line + '\n';
        }
    }
    if (currentIdea) ideas.push(currentIdea);
    return ideas;
}
