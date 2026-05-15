import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Anonymous auth
export async function ensureAuth() {
  return new Promise<string>((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        const cred = await signInAnonymously(auth);
        resolve(cred.user.uid);
      }
    });
  });
}

// Skills types
export interface SkillItem {
  id: string;
  title: string;
  body: string;
  addedBy: 'official' | 'community';
  tags?: string[];
}

export interface Correction {
  id: string;
  itemId: string;
  fix: string;
  timestamp: Date;
  type: 'correction' | 'addition';
}

// Fetch skill items for a category
export async function fetchSkillItems(category: string): Promise<SkillItem[]> {
  const ref = collection(db, 'skills', category, 'items');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SkillItem));
}

// Fetch corrections for a category
export async function fetchCorrections(category: string): Promise<Correction[]> {
  const ref = collection(db, 'skills', category, 'corrections');
  const q = query(ref, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate?.() ?? new Date(),
  } as Correction));
}

// Submit a correction
export async function submitCorrection(
  category: string,
  itemId: string,
  fix: string,
  type: 'correction' | 'addition',
) {
  await ensureAuth();
  const ref = collection(db, 'skills', category, 'corrections');
  await addDoc(ref, { itemId, fix, type, timestamp: serverTimestamp() });
}

// Add a new skill item (from AI generation)
export async function addSkillItem(
  category: string,
  item: Omit<SkillItem, 'id'>,
) {
  await ensureAuth();
  const ref = collection(db, 'skills', category, 'items');
  const docRef = await addDoc(ref, { ...item, addedBy: 'community' });
  return docRef.id;
}

// Seed data runner
export async function seedCategory(
  category: string,
  items: Omit<SkillItem, 'id'>[],
) {
  for (const item of items) {
    const ref = doc(collection(db, 'skills', category, 'items'));
    await setDoc(ref, { ...item, addedBy: 'official' });
  }
}

export {
  collection,
  doc,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
};
