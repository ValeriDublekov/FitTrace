import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export class FirestoreAppError extends Error {
  public readonly operationType: OperationType;
  public readonly path: string | null;
  public readonly authInfo: FirestoreErrorInfo['authInfo'];
  public readonly originalMessage: string;
  public readonly info: FirestoreErrorInfo;

  constructor(originalError: unknown, operationType: OperationType, path: string | null) {
    const originalMessage = originalError instanceof Error ? originalError.message : String(originalError);
    const readableMessage = `Firestore ${operationType} failed on ${path || 'unknown path'}: ${originalMessage}`;
    super(readableMessage);

    this.name = 'FirestoreAppError';
    this.operationType = operationType;
    this.path = path;
    this.originalMessage = originalMessage;

    this.authInfo = {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    };

    this.info = {
      error: originalMessage,
      operationType,
      path,
      authInfo: this.authInfo
    };

    // Restore prototype chain
    Object.setPrototypeOf(this, FirestoreAppError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestoreAppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      operationType: this.operationType,
      path: this.path,
      originalMessage: this.originalMessage,
      authInfo: this.authInfo,
      info: this.info
    };
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const appError = new FirestoreAppError(error, operationType, path);
  console.error('Firestore Error: ', JSON.stringify(appError.info));
  console.error('Firestore App Error details:', appError);
  throw appError;
}

// Internal connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
