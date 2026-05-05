// ==================== Client Management Service ====================
// Handles Firestore CRUD operations for Studio Tier client accounts
import { db, auth } from './firebase.js';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Get a reference to the current user's clients collection
function getClientsRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return collection(db, 'users', uid, 'clients');
}

// ── Fetch all clients ──────────────────────────────────────────
export async function getClients() {
    try {
        const q = query(getClientsRef(), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const clients = [];
        snap.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        return clients;
    } catch (err) {
        console.error('Error fetching clients:', err);
        return [];
    }
}

// ── Add or Update a client ─────────────────────────────────────
export async function saveClient(clientData, existingId = null) {
    try {
        const ref = getClientsRef();
        // Use existing ID for updates, or auto-generate a new ID
        const clientDoc = existingId ? doc(ref, existingId) : doc(ref);

        const payload = {
            name: clientData.name,
            niche: clientData.niche || '',
            tone: clientData.tone || 'Professional',
            audience: clientData.audience || '',
            tags: clientData.tags || [],
            avatarColor: clientData.avatarColor || '#a855f7'
        };

        // Only set createdAt if it's a new document
        if (!existingId) {
            payload.createdAt = serverTimestamp();
        }
        payload.updatedAt = serverTimestamp();

        await setDoc(clientDoc, payload, { merge: true });
        return { success: true, id: clientDoc.id };
    } catch (err) {
        console.error('Error saving client:', err);
        return { success: false, error: err.message };
    }
}

// ── Delete a client ────────────────────────────────────────────
export async function deleteClient(clientId) {
    try {
        await deleteDoc(doc(getClientsRef(), clientId));
        return { success: true };
    } catch (err) {
        console.error('Error deleting client:', err);
        return { success: false, error: err.message };
    }
}
