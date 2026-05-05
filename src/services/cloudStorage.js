// ==================== Cloud Sync (Firestore) Service ====================
import { db } from './firebase.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    orderBy, 
    limit,
    serverTimestamp 
} from 'firebase/firestore';

// ── User Settings (Brand Voice, API Key) ───────────────────────
export async function syncUserSettingsToCloud(uid, settings) {
    if (!uid) return;
    const userDoc = doc(db, 'users', uid);
    await setDoc(userDoc, { 
        settings, 
        lastSynced: serverTimestamp() 
    }, { merge: true });
}

export async function fetchUserSettingsFromCloud(uid) {
    if (!uid) return null;
    const userDoc = doc(db, 'users', uid);
    const snap = await getDoc(userDoc);
    return snap.exists() ? snap.data().settings : null;
}

// ── Saved Items (Generic) ──────────────────────────────────────
// type: 'bios' | 'captions' | 'hashtags' | 'usernames' | 'scripts' | 'stories'
export async function saveItemToCloud(uid, type, data) {
    if (!uid) return null;
    const colRef = collection(db, 'users', uid, `saved_${type}`);
    const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
    });
    return docRef.id;
}

export async function fetchItemsFromCloud(uid, type) {
    if (!uid) return [];
    const colRef = collection(db, 'users', uid, `saved_${type}`);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to ISO string for storage compatibility
        savedAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
}

export async function removeItemFromCloud(uid, type, itemId) {
    if (!uid || !itemId) return;
    const docRef = doc(db, 'users', uid, `saved_${type}`, itemId);
    await deleteDoc(docRef);
}

// ── Bulk Sync (For initial login) ──────────────────────────────
export async function syncAllLocalToCloud(uid, localData) {
    // localData: { bios: [], captions: [], ... }
    // This is a one-time push from local storage to cloud on first login
    for (const [type, items] of Object.entries(localData)) {
        for (const item of items) {
            await saveItemToCloud(uid, type, item);
        }
    }
}
