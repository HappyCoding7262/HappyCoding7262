import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Task, User, CategoryInfo, LocationInfo } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User methods
export function sanitizeObject(obj: any): any {
  if (obj === null) return null;
  if (obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        clean[key] = sanitizeObject(obj[key]);
      }
    }
    return clean;
  }
  return obj;
}

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as User));
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'users');
  });
};

export const saveUser = async (user: User) => {
  try {
    const userDocRef = doc(db, 'users', user.id);
    const sanitized = sanitizeObject({ ...user, uid: user.id });
    await setDoc(userDocRef, sanitized);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
};

export const deleteUserDB = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
};

// Task methods
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as Task));
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'tasks');
  });
};

export const createTaskDB = async (task: Task) => {
  try {
    const taskDocRef = doc(db, 'tasks', task.id);
    await setDoc(taskDocRef, sanitizeObject(task));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `tasks/${task.id}`);
  }
};

export const updateTaskDB = async (taskId: string, data: Partial<Task>) => {
  try {
    const taskDocRef = doc(db, 'tasks', taskId);
    await updateDoc(taskDocRef, sanitizeObject(data));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
  }
};

export const deleteTaskDB = async (taskId: string) => {
  try {
    const taskDocRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
  }
};

// Location methods
export const subscribeToLocations = (callback: (locations: LocationInfo[]) => void) => {
  const q = query(collection(db, 'locations'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as LocationInfo));
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'locations');
  });
};

export const saveLocationDB = async (loc: LocationInfo) => {
  try {
    const locDocRef = doc(db, 'locations', loc.id);
    await setDoc(locDocRef, sanitizeObject(loc));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `locations/${loc.id}`);
  }
};

export const deleteLocationDB = async (locId: string) => {
  try {
    const locDocRef = doc(db, 'locations', locId);
    await deleteDoc(locDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `locations/${locId}`);
  }
};

// Category methods
export const subscribeToCategories = (callback: (categories: CategoryInfo[]) => void) => {
  const q = query(collection(db, 'categories'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as CategoryInfo));
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'categories');
  });
};

export const saveCategoryDB = async (cat: CategoryInfo) => {
  try {
    const catDocRef = doc(db, 'categories', cat.type);
    await setDoc(catDocRef, sanitizeObject(cat));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `categories/${cat.type}`);
  }
};

export const deleteCategoryDB = async (type: string) => {
  try {
    const catDocRef = doc(db, 'categories', type);
    await deleteDoc(catDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${type}`);
  }
};

// Goal methods
export const subscribeToGoal = (callback: (goal: { targetTasks: number; rewardDescription: string }) => void) => {
  const goalDocRef = doc(db, 'goals', 'teamGoal');
  return onSnapshot(goalDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as { targetTasks: number; rewardDescription: string });
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'goals/teamGoal');
  });
};

export const saveGoalDB = async (goal: { targetTasks: number; rewardDescription: string }) => {
  try {
    const goalDocRef = doc(db, 'goals', 'teamGoal');
    await setDoc(goalDocRef, sanitizeObject(goal));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'goals/teamGoal');
  }
};
