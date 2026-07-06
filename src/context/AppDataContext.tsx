import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { AppSettings, UserSettings, Exercise, PersistedExercise, FontSize, Language, NotificationSound, normalizeExerciseCreatePayload, normalizeExerciseUpdatePayload } from '../types';
import { exerciseService } from '../services/exerciseService';

export interface AppDataState {
  user: User | null;
  isAdmin: boolean;
  appSettings: AppSettings | null;
  userSettings: UserSettings;
  visibleExercises: PersistedExercise[];
  globalExercises: PersistedExercise[];
  loading: {
    auth: boolean;
    admin: boolean;
    appSettings: boolean;
    userSettings: boolean;
    exercises: boolean;
  };
  exercisesError: string | null;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  fontSize: 'normal',
  language: 'bg',
  notificationSound: 'default',
  isNotificationsEnabled: true,
  updatedAt: new Date(),
};

interface AppDataContextType {
  state: AppDataState;
  updateAppSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  updateFontSize: (fontSize: FontSize) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateNotificationSound: (notificationSound: NotificationSound) => Promise<void>;
  updateIsNotificationsEnabled: (isNotificationsEnabled: boolean) => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>, adminMode?: boolean) => Promise<string>;
  updateExercise: (id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>, adminMode?: boolean) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  uploadThumbnail: (file: File) => Promise<string>;
  mergeCustomExercise: (customExerciseId: string, systemExerciseId: string, systemExerciseName: string) => Promise<void>;
  refreshExercises: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [state, setState] = useState<AppDataState>({
    user: null,
    isAdmin: false,
    appSettings: null,
    userSettings: DEFAULT_USER_SETTINGS,
    visibleExercises: [],
    globalExercises: [],
    loading: {
      auth: true,
      admin: true,
      appSettings: true,
      userSettings: true,
      exercises: true,
    },
    exercisesError: null,
  });

  // Sync auth state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      user,
      loading: {
        ...prev.loading,
        auth: authLoading,
      }
    }));
  }, [user, authLoading]);

  // Handle admin status
  useEffect(() => {
    let active = true;

    const checkAdminStatus = async () => {
      if (!user) {
        if (active) {
          setState(prev => ({
            ...prev,
            isAdmin: false,
            loading: { ...prev.loading, admin: false }
          }));
        }
        return;
      }

      const path = `admins/${user.uid}`;
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (active) {
          setState(prev => ({
            ...prev,
            isAdmin: adminDoc.exists(),
            loading: { ...prev.loading, admin: false }
          }));
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        handleFirestoreError(error, OperationType.GET, path);
        if (active) {
          setState(prev => ({
            ...prev,
            isAdmin: false,
            loading: { ...prev.loading, admin: false }
          }));
        }
      }
    };

    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, admin: true }
    }));
    checkAdminStatus();

    return () => {
      active = false;
    };
  }, [user]);

  // Handle global App Settings subscription (public read)
  useEffect(() => {
    const docRef = doc(db, 'settings', 'global');
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, appSettings: true }
    }));

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setState(prev => ({
          ...prev,
          appSettings: {
            isPublic: data.isPublic,
            updatedAt: data.updatedAt?.toDate() || new Date(),
            updatedBy: data.updatedBy
          },
          loading: { ...prev.loading, appSettings: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          appSettings: {
            isPublic: true,
            updatedAt: new Date(),
            updatedBy: 'system'
          },
          loading: { ...prev.loading, appSettings: false }
        }));
      }
    }, (error) => {
      console.warn('Silent failure fetching app settings:', error);
      setState(prev => ({
        ...prev,
        appSettings: {
          isPublic: true,
          updatedAt: new Date(),
          updatedBy: 'system'
        },
        loading: { ...prev.loading, appSettings: false }
      }));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle User Settings subscription
  useEffect(() => {
    if (!user) {
      setState(prev => ({
        ...prev,
        userSettings: DEFAULT_USER_SETTINGS,
        loading: { ...prev.loading, userSettings: false }
      }));
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'settings', 'display');
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, userSettings: true }
    }));

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setState(prev => ({
          ...prev,
          userSettings: {
            fontSize: data.fontSize || 'normal',
            language: data.language || 'bg',
            notificationSound: data.notificationSound || 'default',
            isNotificationsEnabled: typeof data.isNotificationsEnabled === 'boolean' ? data.isNotificationsEnabled : true,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          },
          loading: { ...prev.loading, userSettings: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          userSettings: DEFAULT_USER_SETTINGS,
          loading: { ...prev.loading, userSettings: false }
        }));
      }
    }, (error) => {
      console.warn('Error fetching user settings:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, userSettings: false }
      }));
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Exercise fetching
  const refreshExercises = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, exercises: true }
    }));
    try {
      const p1 = exerciseService.getExercises(user?.uid);
      const p2 = exerciseService.getExercises(undefined); // global list
      
      const [visible, global] = await Promise.all([p1, p2]);
      
      setState(prev => ({
        ...prev,
        visibleExercises: visible,
        globalExercises: global,
        exercisesError: null,
        loading: { ...prev.loading, exercises: false }
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        exercisesError: 'Failed to fetch exercises',
        loading: { ...prev.loading, exercises: false }
      }));
      console.error(err);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshExercises();
  }, [refreshExercises]);

  // Mutations
  const updateAppSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;
    const docRef = doc(db, 'settings', 'global');
    try {
      await setDoc(docRef, {
        ...state.appSettings,
        ...newSettings,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  const updateFontSize = async (fontSize: FontSize) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'display');
    try {
      await setDoc(docRef, {
        fontSize,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/settings/display`);
    }
  };

  const updateLanguage = async (language: Language) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'display');
    try {
      await setDoc(docRef, {
        language,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/settings/display`);
    }
  };

  const updateNotificationSound = async (notificationSound: NotificationSound) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'display');
    try {
      await setDoc(docRef, {
        notificationSound,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/settings/display`);
    }
  };

  const updateIsNotificationsEnabled = async (isNotificationsEnabled: boolean) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'display');
    try {
      await setDoc(docRef, {
        isNotificationsEnabled,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/settings/display`);
    }
  };

  const addExercise = useCallback(async (exercise: Omit<Exercise, 'id' | 'createdAt'>, adminMode: boolean = false) => {
    try {
      const exerciseData = normalizeExerciseCreatePayload(exercise, adminMode, user?.uid);

      const id = await exerciseService.createExercise(exerciseData);
      await refreshExercises();
      return id;
    } catch (err) {
      setState(prev => ({ ...prev, exercisesError: 'Failed to add exercise' }));
      throw err;
    }
  }, [user, refreshExercises]);

  const updateExercise = useCallback(async (id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>, adminMode: boolean = false) => {
    try {
      const exerciseData = normalizeExerciseUpdatePayload(exercise, adminMode, user?.uid);

      await exerciseService.updateExercise(id, exerciseData);
      await refreshExercises();
    } catch (err) {
      setState(prev => ({ ...prev, exercisesError: 'Failed to update exercise' }));
      throw err;
    }
  }, [user, refreshExercises]);

  const deleteExercise = useCallback(async (id: string) => {
    try {
      await exerciseService.deleteExercise(id);
      await refreshExercises();
    } catch (err) {
      setState(prev => ({ ...prev, exercisesError: 'Failed to delete exercise' }));
      throw err;
    }
  }, [refreshExercises]);

  const uploadThumbnail = useCallback(async (file: File) => {
    try {
      return await exerciseService.uploadThumbnail(file);
    } catch (err) {
      setState(prev => ({ ...prev, exercisesError: 'Failed to upload image' }));
      throw err;
    }
  }, []);

  const mergeCustomExercise = useCallback(async (customExerciseId: string, systemExerciseId: string, systemExerciseName: string) => {
    if (!user?.uid) return;
    try {
      await exerciseService.mergeCustomExercise(customExerciseId, systemExerciseId, systemExerciseName, user.uid);
      await refreshExercises();
    } catch (err) {
      setState(prev => ({ ...prev, exercisesError: 'Failed to merge exercise' }));
      throw err;
    }
  }, [user, refreshExercises]);

  return (
    <AppDataContext.Provider
      value={{
        state,
        updateAppSettings,
        updateFontSize,
        updateLanguage,
        updateNotificationSound,
        updateIsNotificationsEnabled,
        addExercise,
        updateExercise,
        deleteExercise,
        uploadThumbnail,
        mergeCustomExercise,
        refreshExercises,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
