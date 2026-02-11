import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ── Types ──────────────────────────────────────────────────────────

export interface UserProfile {
  username: string;
  email: string;
  enabled: boolean;
  createdAt: Timestamp;
}

export interface UserSettings {
  threadsPerPage: number;
  postsPerPage: number;
  profilePostsPerPage: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface Thread {
  id: string;
  title: string;
  categoryId: string;
  authorId: string;
  authorUsername: string;
  createdAt: Timestamp;
  lastPostAt: Timestamp;
  isPinned: boolean;
  isLocked: boolean;
}

export interface Post {
  id: string;
  content: string;
  threadId: string;
  authorId: string;
  authorUsername: string;
  createdAt: Timestamp;
  editedAt?: Timestamp;
}

// ── Helpers ────────────────────────────────────────────────────────

function requireAuth(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

function paginate<T>(all: T[], page: number, pageSize: number): PaginatedResult<T> {
  const totalElements = all.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const start = page * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, currentPage: page, totalPages, totalElements };
}

// ── User Profile ───────────────────────────────────────────────────

export async function setupUserProfile(username: string): Promise<void> {
  const uid = requireAuth();
  const user = auth.currentUser!;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      username,
      email: user.email,
      enabled: true,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile & { uid: string }> {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('User not found');
  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...(docSnap.data() as UserProfile) };
}

// ── User Settings ──────────────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  threadsPerPage: 10,
  postsPerPage: 10,
  profilePostsPerPage: 10,
};

export async function getUserSettings(): Promise<UserSettings> {
  const uid = requireAuth();
  const snap = await getDoc(doc(db, 'userSettings', uid));
  if (!snap.exists()) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<UserSettings>) };
}

export async function updateUserSettings(settings: UserSettings): Promise<UserSettings> {
  const uid = requireAuth();
  await setDoc(doc(db, 'userSettings', uid), settings);
  return settings;
}

// ── Categories ─────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, 'categories'), orderBy('sortOrder'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
}

export async function getCategory(id: string): Promise<Category> {
  const snap = await getDoc(doc(db, 'categories', id));
  if (!snap.exists()) throw new Error('Category not found');
  return { id: snap.id, ...(snap.data() as Omit<Category, 'id'>) };
}

// ── Threads ────────────────────────────────────────────────────────

export async function getThreadsByCategory(
  categoryId: string,
  page: number,
  pageSize: number
): Promise<{
  category: Category;
  threads: Thread[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}> {
  const category = await getCategory(categoryId);

  const q = query(
    collection(db, 'threads'),
    where('categoryId', '==', categoryId),
    orderBy('isPinned', 'desc'),
    orderBy('lastPostAt', 'desc')
  );
  const snap = await getDocs(q);
  const allThreads = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Thread, 'id'>) }));

  const { items, currentPage, totalPages, totalElements } = paginate(allThreads, page, pageSize);

  return { category, threads: items, currentPage, totalPages, totalElements };
}

export async function getThread(id: string): Promise<Thread> {
  const snap = await getDoc(doc(db, 'threads', id));
  if (!snap.exists()) throw new Error('Thread not found');
  return { id: snap.id, ...(snap.data() as Omit<Thread, 'id'>) };
}

export async function createThread(
  categoryId: string,
  title: string,
  content: string
): Promise<Thread> {
  const uid = requireAuth();
  const user = auth.currentUser!;
  const username = user.displayName || 'Anonymous';
  const now = serverTimestamp();

  // Create the thread document
  const threadRef = await addDoc(collection(db, 'threads'), {
    title,
    categoryId,
    authorId: uid,
    authorUsername: username,
    createdAt: now,
    lastPostAt: now,
    isPinned: false,
    isLocked: false,
  });

  // Create the first post (OP)
  await addDoc(collection(db, 'posts'), {
    content,
    threadId: threadRef.id,
    authorId: uid,
    authorUsername: username,
    createdAt: now,
  });

  // Return the thread so the caller can navigate to it
  const snap = await getDoc(threadRef);
  return { id: snap.id, ...(snap.data() as Omit<Thread, 'id'>) };
}

// ── Posts ───────────────────────────────────────────────────────────

export async function getPostsByThread(
  threadId: string,
  page: number,
  pageSize: number
): Promise<{
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}> {
  const q = query(
    collection(db, 'posts'),
    where('threadId', '==', threadId),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  const allPosts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));

  const { items, currentPage, totalPages, totalElements } = paginate(allPosts, page, pageSize);

  return { posts: items, currentPage, totalPages, totalElements };
}

export async function createPost(threadId: string, content: string): Promise<Post> {
  const uid = requireAuth();
  const user = auth.currentUser!;
  const username = user.displayName || 'Anonymous';
  const now = serverTimestamp();

  const postRef = await addDoc(collection(db, 'posts'), {
    content,
    threadId,
    authorId: uid,
    authorUsername: username,
    createdAt: now,
  });

  // Update thread lastPostAt
  await updateDoc(doc(db, 'threads', threadId), {
    lastPostAt: now,
  });

  const snap = await getDoc(postRef);
  return { id: snap.id, ...(snap.data() as Omit<Post, 'id'>) };
}

export async function getPostsByUser(
  uid: string,
  page: number,
  pageSize: number
): Promise<{
  posts: (Post & { threadTitle: string; categoryId: string })[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}> {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);

  // Enrich posts with thread info
  const allPosts = await Promise.all(
    snap.docs.map(async (d) => {
      const postData = d.data() as Omit<Post, 'id'>;
      let threadTitle = 'Unknown Thread';
      let categoryId = '';
      try {
        const thread = await getThread(postData.threadId);
        threadTitle = thread.title;
        categoryId = thread.categoryId;
      } catch {
        // thread may have been deleted
      }
      return {
        id: d.id,
        ...postData,
        threadTitle,
        categoryId,
      } as Post & { threadTitle: string; categoryId: string };
    })
  );

  const { items, currentPage, totalPages, totalElements } = paginate(allPosts, page, pageSize);

  return { posts: items, currentPage, totalPages, totalElements };
}
