import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Task, User } from '../types';

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
    const userDocRef = doc(db, 'users', user.id); // Or user.uid based on our blueprint, although types.ts has id
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, { ...user, uid: user.id, createdAt: serverTimestamp() });
    } else {
      await updateDoc(userDocRef, { ...user, uid: user.id });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
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
    await setDoc(taskDocRef, task);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `tasks/${task.id}`);
  }
};

export const updateTaskDB = async (taskId: string, data: Partial<Task>) => {
  try {
    const taskDocRef = doc(db, 'tasks', taskId);
    await updateDoc(taskDocRef, data);
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
