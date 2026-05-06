import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './useAuth';
import { AppSettings } from '../types';

export const useAppSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We allow fetching settings even without a user now (public read)
    // but we might want to refresh when user changes
    const docRef = doc(db, 'settings', 'global');
    
    setLoading(true);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          isPublic: data.isPublic,
          updatedAt: data.updatedAt.toDate(),
          updatedBy: data.updatedBy
        });
      } else {
        // Default settings if none exist
        setSettings({
          isPublic: true,
          updatedAt: new Date(),
          updatedBy: 'system'
        });
      }
      setLoading(false);
    }, (error) => {
      // If we still get a permission error (e.g. rules haven't propagated), 
      // we'll just log it but not crash the whole app with handleFirestoreError
      // unless we really want it to be fatal. 
      // For global settings, let's be more lenient.
      console.warn('Silent failure fetching settings (might be public/private transition):', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]); // Re-subscribe if user changes, though public read should handle it.

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;

    const docRef = doc(db, 'settings', 'global');
    try {
      await setDoc(docRef, {
        ...settings,
        ...newSettings,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  return { settings, loading, updateSettings };
};
