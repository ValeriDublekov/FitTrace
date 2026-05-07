import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './useAuth';
import { UserSettings, FontSize, Language } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  fontSize: 'normal',
  language: 'bg',
  updatedAt: new Date(),
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'settings', 'display');
    
    setLoading(true);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          fontSize: data.fontSize || 'normal',
          language: data.language || 'bg',
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Error fetching user settings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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

  return { settings, loading, updateFontSize, updateLanguage };
};
