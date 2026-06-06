import { useAppData } from '../context/AppDataContext';

export const useAdmin = () => {
  const { state } = useAppData();
  return { 
    isAdmin: state.isAdmin, 
    loading: state.loading.admin 
  };
};
