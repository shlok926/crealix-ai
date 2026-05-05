// ==================== AI Image Generation Service ====================
import { getApiKey } from '../utils/storage.js';

// We'll use a reliable Image Generation model. 
// For now, we'll try to use OpenRouter's supported image models or a dedicated endpoint.
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const IMAGE_MODEL = 'black-forest-labs/flux-1-dev'; // Flux is amazing for Instagram aesthetics

export async function generateAiImage(prompt, aspectRatio = '1:1') {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API_KEY_MISSING');

    // Note: Image generation via Chat Completions is supported by some providers on OpenRouter
    // If not, we can easily switch to a dedicated image API.
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Crealix AI'
        },
        body: JSON.stringify({
            model: IMAGE_MODEL,
            prompt: `${prompt}, high quality, instagram aesthetic, 4k, professional photography, ${aspectRatio} aspect ratio`,
            // Some providers use 'messages' for image generation too
            messages: [
                { role: 'user', content: `Generate an image of: ${prompt}. Aspect ratio: ${aspectRatio}. Instagram style.` }
            ],
            response_format: { type: 'url' } // Standard for image APIs
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Image API error: ${response.status}`);
    }

    const data = await response.json();
    // Logic varies by provider, but usually it's in a specific field
    return data.images?.[0] || data.data?.[0]?.url || data.choices?.[0]?.message?.content?.match(/https:\/\/\S+/)?.[0];
}

// ── Prompt Enhancer ──────────────────────────────────────────
// Use the standard LLM to turn a simple prompt into a professional one
import { generateBios } from './ai.js'; // We can reuse callAI logic

async function callAIGeneric(systemPrompt, userPrompt) {
    const apiKey = getApiKey();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

export async function enhanceImagePrompt(userPrompt) {
    return await callAIGeneric(
        'You are an expert AI prompt engineer for Midjourney and Flux. Turn the user prompt into a detailed, high-quality, professional photography prompt. Focus on lighting, composition, and Instagram aesthetic. No explanation, just the enhanced prompt.',
        userPrompt
    );
}
