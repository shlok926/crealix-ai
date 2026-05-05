// ==================== User Plan Service ====================
// Saves and retrieves user plan/role from Firestore
// Plans: 'spark' | 'creator' | 'studio'
import { db } from './firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const PLAN_LIMITS = {
    spark: {
        bioGenerations: 5,
        usernameGenerations: 3,
        saveLimit: 10,
        features: ['bio', 'username', 'hashtags', 'preview']
    },
    creator: {
        bioGenerations: Infinity,
        usernameGenerations: Infinity,
        saveLimit: Infinity,
        features: ['bio', 'username', 'hashtags', 'preview', 'captions', 'hooks', 'audit', 'reel-script', 'story-ideas', 'bio-link']
    },
    studio: {
        bioGenerations: Infinity,
        usernameGenerations: Infinity,
        saveLimit: Infinity,
        clients: 10,
        features: ['*'] // all features
    }
};

// Get the user's profile (plan + type) from Firestore
export async function getUserProfile(uid) {
    try {
        const ref = doc(db, 'users', uid, 'profile', 'main');
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data();
        return null; // new user — no plan yet
    } catch (e) {
        console.error('getUserProfile error:', e);
        return null;
    }
}

// Save the chosen plan after onboarding
export async function saveUserPlan(uid, plan) {
    try {
        const ref = doc(db, 'users', uid, 'profile', 'main');
        await setDoc(ref, {
            plan,          // 'spark' | 'creator' | 'studio'
            userType: plan,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (e) {
        console.error('saveUserPlan error:', e);
        return false;
    }
}

// Get plan limits for feature-gating
export function getPlanLimits(plan = 'spark') {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.spark;
}

// Check if a feature is available for a plan
export function hasFeature(plan = 'spark', feature) {
    const limits = PLAN_LIMITS[plan];
    if (!limits) return false;
    if (limits.features.includes('*')) return true;
    return limits.features.includes(feature);
}

// Cache plan in localStorage for fast access (no Firestore call on every page)
export function cachePlan(plan) {
    localStorage.setItem('biospark_plan', plan);
}

export function getCachedPlan() {
    return localStorage.getItem('biospark_plan') || 'spark';
}

export function clearCachedPlan() {
    localStorage.removeItem('biospark_plan');
}
