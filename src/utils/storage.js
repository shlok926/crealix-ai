// ==================== Storage Utilities ====================
import { uid } from './helpers.js';
import { auth } from '../services/firebase.js';
import { 
    saveItemToCloud, 
    removeItemFromCloud, 
    syncUserSettingsToCloud,
    fetchItemsFromCloud,
    fetchUserSettingsFromCloud
} from '../services/cloudStorage.js';

const KEYS = {
    API_KEY: 'biospark_api_key',
    THEME: 'biospark_theme',
    SAVED_BIOS: 'biospark_saved_bios',
    SAVED_USERNAMES: 'biospark_saved_usernames',
    SAVED_HASHTAGS: 'biospark_saved_hashtags',
    SAVED_CAPTIONS: 'biospark_saved_captions',
    SAVED_TEMPLATES: 'biospark_saved_templates',
    SAVED_SCRIPTS: 'biospark_saved_scripts',
    SAVED_STORIES: 'biospark_saved_stories',
    BRAND_VOICE: 'biospark_brand_voice',
    USAGE: 'biospark_usage'
};

// ── Sync Helper ───────────────────────────────────────────────
export async function syncAllFromCloud() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Sync Settings
        const settings = await fetchUserSettingsFromCloud(user.uid);
        if (settings) {
            if (settings.apiKey) setApiKey(settings.apiKey);
            if (settings.brandVoice) setBrandVoice(settings.brandVoice);
        }

        // Sync Collections
        const types = ['bios', 'usernames', 'hashtags', 'captions', 'templates', 'scripts', 'stories'];
        for (const type of types) {
            const cloudItems = await fetchItemsFromCloud(user.uid, type);
            if (cloudItems.length > 0) {
                const key = KEYS[`SAVED_${type.toUpperCase()}`];
                saveList(key, cloudItems);
            }
        }
    } catch (e) {
        console.error('Cloud sync failed:', e);
    }
}

// ── API Key ──────────────────────────────────────────────────
export function getApiKey() { return 'backend-proxy-active'; }
export function setApiKey(key) { 
    localStorage.setItem(KEYS.API_KEY, key.trim()); 
    const user = auth.currentUser;
    if (user) {
        syncUserSettingsToCloud(user.uid, { apiKey: key.trim(), brandVoice: getBrandVoice() });
    }
}

// ── Theme ────────────────────────────────────────────────────
export function getTheme() { return localStorage.getItem(KEYS.THEME) || 'dark'; }
export function setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
}

// ── Generic helpers ──────────────────────────────────────────
function getList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}
function makeEntry(data) {
    return { id: uid(), savedAt: new Date().toISOString(), ...data };
}

// ── Bios ─────────────────────────────────────────────────────
export function getSavedBios() { return getList(KEYS.SAVED_BIOS); }
export function saveBio(text) {
    const entry = makeEntry({ text });
    const list = getSavedBios();
    list.unshift(entry);
    saveList(KEYS.SAVED_BIOS, list);
    
    const user = auth.currentUser;
    if (user) saveItemToCloud(user.uid, 'bios', entry);
    
    return entry;
}
export function removeBio(id) {
    saveList(KEYS.SAVED_BIOS, getSavedBios().filter(b => b.id !== id));
    const user = auth.currentUser;
    if (user) removeItemFromCloud(user.uid, 'bios', id);
}

// ── Usernames ─────────────────────────────────────────────────
export function getSavedUsernames() { return getList(KEYS.SAVED_USERNAMES); }
export function saveUsername(text) {
    const entry = makeEntry({ text });
    const list = getSavedUsernames();
    list.unshift(entry);
    saveList(KEYS.SAVED_USERNAMES, list);
    
    const user = auth.currentUser;
    if (user) saveItemToCloud(user.uid, 'usernames', entry);
    
    return entry;
}
export function removeUsername(id) {
    saveList(KEYS.SAVED_USERNAMES, getSavedUsernames().filter(u => u.id !== id));
    const user = auth.currentUser;
    if (user) removeItemFromCloud(user.uid, 'usernames', id);
}

// ── Hashtags ─────────────────────────────────────────────────
export function getSavedHashtags() { return getList(KEYS.SAVED_HASHTAGS); }
export function saveHashtag(tags, name = 'Hashtag Set') {
    const entry = makeEntry({ tags, name });
    const list = getSavedHashtags();
    list.unshift(entry);
    saveList(KEYS.SAVED_HASHTAGS, list);
    
    const user = auth.currentUser;
    if (user) saveItemToCloud(user.uid, 'hashtags', entry);
    
    return entry;
}
export function removeHashtag(id) {
    saveList(KEYS.SAVED_HASHTAGS, getSavedHashtags().filter(h => h.id !== id));
    const user = auth.currentUser;
    if (user) removeItemFromCloud(user.uid, 'hashtags', id);
}

// ── Captions ─────────────────────────────────────────────────
export function getSavedCaptions() { return getList(KEYS.SAVED_CAPTIONS); }
export function saveCaption(text) {
    const entry = makeEntry({ text });
    const list = getSavedCaptions();
    list.unshift(entry);
    saveList(KEYS.SAVED_CAPTIONS, list);
    
    const user = auth.currentUser;
    if (user) saveItemToCloud(user.uid, 'captions', entry);
    
    return entry;
}
export function removeCaption(id) {
    saveList(KEYS.SAVED_CAPTIONS, getSavedCaptions().filter(c => c.id !== id));
    const user = auth.currentUser;
    if (user) removeItemFromCloud(user.uid, 'captions', id);
}

// ── Templates ─────────────────────────────────────────────────
export function getSavedTemplates() { return getList(KEYS.SAVED_TEMPLATES); }
export function saveTemplate(text) {
    const entry = makeEntry({ text });
    const list = getSavedTemplates();
    list.unshift(entry);
    saveList(KEYS.SAVED_TEMPLATES, list);
    return entry;
}
export function removeTemplate(id) {
    saveList(KEYS.SAVED_TEMPLATES, getSavedTemplates().filter(t => t.id !== id));
}

// ── Reel Scripts ─────────────────────────────────────────────
export function getSavedScripts() { return getList(KEYS.SAVED_SCRIPTS); }
export function saveScript(data) {
    const entry = makeEntry(data);
    const list = getSavedScripts();
    list.unshift(entry);
    saveList(KEYS.SAVED_SCRIPTS, list);
    return entry;
}
export function removeScript(id) {
    saveList(KEYS.SAVED_SCRIPTS, getSavedScripts().filter(s => s.id !== id));
}

// ── Story Ideas ──────────────────────────────────────────────
export function getSavedStories() { return getList(KEYS.SAVED_STORIES); }
export function saveStoryIdea(data) {
    const entry = makeEntry(data);
    const list = getSavedStories();
    list.unshift(entry);
    saveList(KEYS.SAVED_STORIES, list);
    return entry;
}
export function removeStoryIdea(id) {
    saveList(KEYS.SAVED_STORIES, getSavedStories().filter(s => s.id !== id));
}

export function getBrandVoice() {
    try {
        return JSON.parse(localStorage.getItem(KEYS.BRAND_VOICE) || '{"name":"","niche":"","tone":"Professional"}');
    } catch {
        return { name: '', niche: '', tone: 'Professional' };
    }
}
export function setBrandVoice(data) {
    localStorage.setItem(KEYS.BRAND_VOICE, JSON.stringify(data));
    const user = auth.currentUser;
    if (user) {
        syncUserSettingsToCloud(user.uid, { apiKey: getApiKey(), brandVoice: data });
    }
}

// ── Usage Tracking ────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }

export function setSidebarCollapsed(collapsed) {
    if (collapsed) {
        localStorage.setItem(KEYS.SIDEBAR_COLLAPSED, 'true');
    } else {
        localStorage.removeItem(KEYS.SIDEBAR_COLLAPSED);
    }
}

// ── Data Export (JSON) ───────────────────────────────────────
export function exportAllUserData() {
    const data = {
        bios: getSavedBios(),
        usernames: getSavedUsernames(),
        hashtags: getSavedHashtags(),
        captions: getSavedCaptions(),
        templates: getSavedTemplates(),
        scripts: getSavedScripts(),
        stories: getSavedStories(),
        brandVoice: getBrandVoice(),
        usage: getDailyUsage()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "crealix_account_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export function getDailyUsage() {
    try {
        const raw = localStorage.getItem(KEYS.USAGE);
        if (!raw) return { date: today(), count: 0 };
        const data = JSON.parse(raw);
        if (data.date !== today()) return { date: today(), count: 0 };
        return data;
    } catch { return { date: today(), count: 0 }; }
}

export function incrementUsage() {
    const usage = getDailyUsage();
    usage.count += 1;
    usage.date = today();
    localStorage.setItem(KEYS.USAGE, JSON.stringify(usage));
}

export function checkUsageLimit(plan = 'free') {
    // Open Source: Unlimited for everyone
    return true;
}
