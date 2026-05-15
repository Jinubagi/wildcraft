import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';

const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Wrap any promise with a timeout so Firestore permission hangs fail fast
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms),
    ),
  ]);
}

// Skills types
export interface SkillItem {
  id: string;
  title: string;
  body: string;
  addedBy: 'official' | 'community';
  tags?: string[];
  createdAt?: unknown;
}

// ---- localStorage fallback for community skills ----
const LS_KEY = (cat: string) => `wildcraft_community_skills_${cat}`;

export function getLocalSkills(category: string): SkillItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY(category)) ?? '[]') as SkillItem[];
  } catch {
    return [];
  }
}

export function saveLocalSkill(category: string, item: Omit<SkillItem, 'id'>): SkillItem {
  const existing = getLocalSkills(category);
  const newItem: SkillItem = { ...item, id: `local-${Date.now()}` };
  localStorage.setItem(LS_KEY(category), JSON.stringify([...existing, newItem]));
  return newItem;
}

// Key for deleted item IDs
const DELETED_KEY = (cat: string) => `wildcraft_deleted_${cat}`;

export function getDeletedItems(category: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DELETED_KEY(category)) ?? '[]') as string[]);
  } catch { return new Set(); }
}

export function deleteSkillItem(category: string, id: string): void {
  // Mark as deleted in localStorage
  const deleted = getDeletedItems(category);
  deleted.add(id);
  localStorage.setItem(DELETED_KEY(category), JSON.stringify([...deleted]));

  // If it's a local community item, also remove from community skills list
  if (id.startsWith('local-')) {
    const existing = getLocalSkills(category).filter((s) => s.id !== id);
    localStorage.setItem(LS_KEY(category), JSON.stringify(existing));
  }
}

// Key for overrides (edits applied on top of seed/Firebase items)
const OVERRIDE_KEY = (cat: string) => `wildcraft_overrides_${cat}`;

export function getLocalOverrides(category: string): Record<string, Partial<SkillItem>> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY(category)) ?? '{}');
  } catch {
    return {};
  }
}

export function saveLocalOverride(category: string, id: string, patch: Partial<SkillItem>): void {
  const overrides = getLocalOverrides(category);
  overrides[id] = { ...overrides[id], ...patch };
  localStorage.setItem(OVERRIDE_KEY(category), JSON.stringify(overrides));
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
  if (!isFirebaseConfigured) return [];
  const ref = collection(db, 'skills', category, 'items');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SkillItem));
}

// Fetch corrections for a category
export async function fetchCorrections(category: string): Promise<Correction[]> {
  if (!isFirebaseConfigured) return [];
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
  if (!isFirebaseConfigured) return;
  const ref = collection(db, 'skills', category, 'corrections');
  await withTimeout(addDoc(ref, { itemId, fix, type, timestamp: serverTimestamp() }));
}

// Update an existing skill item (body + tags)
export async function updateSkillItem(
  category: string,
  id: string,
  patch: Partial<Pick<SkillItem, 'body' | 'tags'>>,
): Promise<void> {
  // Always apply locally first
  saveLocalOverride(category, id, patch);

  // Try Firebase in background
  if (isFirebaseConfigured && !id.startsWith('static-') && !id.startsWith('local-')) {
    const ref = doc(db, 'skills', category, 'items', id);
    withTimeout(
      import('firebase/firestore').then(({ updateDoc }) => updateDoc(ref, patch as Record<string, unknown>)),
    ).catch(() => {/* optional */});
  }
}

// Add a new skill item (from AI generation)
// Always saves to localStorage first, then tries Firebase as a bonus.
export async function addSkillItem(
  category: string,
  item: Omit<SkillItem, 'id'>,
): Promise<string> {
  // localStorage is the guaranteed persistent store
  const saved = saveLocalSkill(category, item);

  // Try Firebase in background — don't block or throw on failure
  if (isFirebaseConfigured) {
    const ref = collection(db, 'skills', category, 'items');
    withTimeout(addDoc(ref, { ...item, addedBy: 'community' })).catch(() => {/* optional */});
  }

  return saved.id;
}

// Seed data runner
export async function seedCategory(
  category: string,
  items: Omit<SkillItem, 'id'>[],
) {
  if (!isFirebaseConfigured) return;
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
  if (!isFirebaseConfigured) return [];
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
  if (!isFirebaseConfigured) return;
  const ref = collection(db, 'qna_questions');
  await withTimeout(addDoc(ref, {
    title,
    body,
    authorNickname: nickname,
    createdAt: serverTimestamp(),
    answersCount: 0,
  }));
}

// Fetch answers for a question
export async function fetchAnswers(questionId: string): Promise<QnaAnswer[]> {
  if (!isFirebaseConfigured) return [];
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
  if (!isFirebaseConfigured) return;
  const answersRef = collection(db, 'qna_questions', questionId, 'answers');
  const questionRef = doc(db, 'qna_questions', questionId);
  await withTimeout(addDoc(answersRef, {
    body,
    authorNickname: nickname,
    createdAt: serverTimestamp(),
  }));
  // Increment answersCount
  try {
    await withTimeout(runTransaction(db, async (transaction) => {
      const qDoc = await transaction.get(questionRef);
      if (qDoc.exists()) {
        const current = (qDoc.data().answersCount as number) ?? 0;
        transaction.update(questionRef, { answersCount: current + 1 });
      }
    }));
  } catch {
    // Non-critical
  }
}

// ---- Nickname registry ----

// Check if a nickname is already taken (returns true if available)
export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  if (!isFirebaseConfigured) return true; // offline: allow anything
  try {
    const ref = doc(db, 'nicknames', nickname.trim().toLowerCase());
    const snap = await withTimeout(getDoc(ref), 5000);
    return !snap.exists();
  } catch {
    return true; // on timeout/error, don't block the user
  }
}

// Register a nickname in Firestore
export async function registerNickname(nickname: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const ref = doc(db, 'nicknames', nickname.trim().toLowerCase());
    await withTimeout(setDoc(ref, {
      nickname,
      registeredAt: serverTimestamp(),
    }));
  } catch {
    // Non-critical — local nickname still saved
  }
}

// ---- Activity log ----

export interface ActivityLog {
  id: string;
  nickname: string;
  action: 'skill_edit' | 'skill_add' | 'daily_done' | 'qna_question' | 'qna_answer';
  detail: string;        // human-readable: "보울라인 매듭 수정"
  category?: string;
  timestamp: Timestamp | null;
}

export async function logActivity(
  nickname: string,
  action: ActivityLog['action'],
  detail: string,
  category?: string,
): Promise<void> {
  if (!isFirebaseConfigured || !nickname) return;
  try {
    const ref = collection(db, 'activity_logs');
    await withTimeout(addDoc(ref, {
      nickname,
      action,
      detail,
      category: category ?? null,
      timestamp: serverTimestamp(),
    }), 5000);
  } catch {
    // Non-critical
  }
}

export async function fetchActivityLogs(count = 50): Promise<ActivityLog[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'activity_logs');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(count));
    const snap = await withTimeout(getDocs(q), 8000);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
  } catch {
    return [];
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
