import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkoutSession } from '../../../hooks/useWorkoutSession';

type WorkoutSessionContextType = ReturnType<typeof useWorkoutSession>;

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);

export const WorkoutSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const session = useWorkoutSession();
  return (
    <WorkoutSessionContext.Provider value={session}>
      {children}
    </WorkoutSessionContext.Provider>
  );
};

export const useWorkoutContext = () => {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error('useWorkoutContext must be used within a WorkoutSessionProvider');
  }
  return context;
};
