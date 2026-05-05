import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const path = `admins/${user.uid}`;
      console.log('Checking admin status for UID:', user.uid);
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        console.log('Admin document exists:', adminDoc.exists());
        if (adminDoc.exists()) {
          console.log('Admin data:', adminDoc.data());
        }
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error('Error checking admin status:', error);
        // We don't necessarily want to throw here as it might just be a permission denied
        // which is expected for non-admins if rules are strict, but we handle it.
        handleFirestoreError(error, OperationType.GET, path);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
