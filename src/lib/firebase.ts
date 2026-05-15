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
  Timestamp,
  runTransaction,
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

// ---- Q&A Types ----

export interface QnaQuestion {
  id: string;
  title: string;
  body: string;
  authorNickname: string;
  createdAt: Timestamp;
  answersCount: number;
}

export interface QnaAnswer {
  id: string;
  body: string;
  authorNickname: string;
  createdAt: Timestamp;
}

// Fetch all questions ordered by newest first
export async function fetchQuestions(): Promise<QnaQuestion[]> {
  const ref = collection(db, 'qna_questions');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QnaQuestion));
}

// Submit a new question
export async function submitQuestion(
  title: string,
  body: string,
  nickname: string,
): Promise<void> {
  await ensureAuth();
  const ref = collection(db, 'qna_questions');
  await addDoc(ref, {
    title,
    body,
    authorNickname: nickname,
    createdAt: serverTimestamp(),
    answersCount: 0,
  });
}

// Fetch answers for a question
export async function fetchAnswers(questionId: string): Promise<QnaAnswer[]> {
  const ref = collection(db, 'qna_questions', questionId, 'answers');
  const q = query(ref, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QnaAnswer));
}

// Submit an answer
export async function submitAnswer(
  questionId: string,
  body: string,
  nickname: string,
): Promise<void> {
  await ensureAuth();
  const answersRef = collection(db, 'qna_questions', questionId, 'answers');
  const questionRef = doc(db, 'qna_questions', questionId);
  await addDoc(answersRef, {
    body,
    authorNickname: nickname,
    createdAt: serverTimestamp(),
  });
  // Increment answersCount
  try {
    await runTransaction(db, async (transaction) => {
      const qDoc = await transaction.get(questionRef);
      if (qDoc.exists()) {
        const current = (qDoc.data().answersCount as number) ?? 0;
        transaction.update(questionRef, { answersCount: current + 1 });
      }
    });
  } catch {
    // Non-critical
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
  Timestamp,
};
