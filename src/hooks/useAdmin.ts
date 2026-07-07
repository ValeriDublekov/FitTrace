import { useAdminContext } from '../context/AppDataContext';

export const useAdmin = () => {
  const { isAdmin, loading } = useAdminContext();
  return { 
    isAdmin, 
    loading 
  };
};
