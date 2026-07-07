import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useWorkoutSession } from '../../../hooks/useWorkoutSession';

type WorkoutSessionContextType = ReturnType<typeof useWorkoutSession>;

// Separate types for modular contexts to keep them clean and strongly typed
export type WorkoutSessionState = {
  activeExercises: WorkoutSessionContextType['activeExercises'];
  workoutNotes: WorkoutSessionContextType['workoutNotes'];
  workoutDate: WorkoutSessionContextType['workoutDate'];
  workoutStartedAt: WorkoutSessionContextType['workoutStartedAt'];
  sessionMode: WorkoutSessionContextType['sessionMode'];
  expandedExerciseId: WorkoutSessionContextType['expandedExerciseId'];
  restTimer: WorkoutSessionContextType['restTimer'];
  isSaving: WorkoutSessionContextType['isSaving'];
};

export type WorkoutSessionStatus = {
  hasActiveSession: WorkoutSessionContextType['hasActiveSession'];
  isActiveLive: WorkoutSessionContextType['isActiveLive'];
  isActiveManual: WorkoutSessionContextType['isActiveManual'];
};

export type WorkoutSessionActions = {
  setWorkoutNotes: WorkoutSessionContextType['setWorkoutNotes'];
  setWorkoutDate: WorkoutSessionContextType['setWorkoutDate'];
  setSessionMode: WorkoutSessionContextType['setSessionMode'];
  addExercise: WorkoutSessionContextType['addExercise'];
  removeExercise: WorkoutSessionContextType['removeExercise'];
  updateSet: WorkoutSessionContextType['updateSet'];
  addSet: WorkoutSessionContextType['addSet'];
  removeSet: WorkoutSessionContextType['removeSet'];
  finishWorkout: WorkoutSessionContextType['finishWorkout'];
  markExerciseAsCompleted: WorkoutSessionContextType['markExerciseAsCompleted'];
  removeIncompleteSets: WorkoutSessionContextType['removeIncompleteSets'];
  setExpandedExerciseId: WorkoutSessionContextType['setExpandedExerciseId'];
  startRestTimer: WorkoutSessionContextType['startRestTimer'];
  clearRestTimer: WorkoutSessionContextType['clearRestTimer'];
  updateExerciseNotes: WorkoutSessionContextType['updateExerciseNotes'];
  clearSession: WorkoutSessionContextType['clearSession'];
  startWorkoutFromTemplate: WorkoutSessionContextType['startWorkoutFromTemplate'];
  combineExercises: WorkoutSessionContextType['combineExercises'];
  uncombineSuperset: WorkoutSessionContextType['uncombineSuperset'];
};

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);
const WorkoutSessionStateContext = createContext<WorkoutSessionState | undefined>(undefined);
const WorkoutSessionStatusContext = createContext<WorkoutSessionStatus | undefined>(undefined);
const WorkoutSessionActionsContext = createContext<WorkoutSessionActions | undefined>(undefined);

export const WorkoutSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const session = useWorkoutSession();

  const state = useMemo<WorkoutSessionState>(() => ({
    activeExercises: session.activeExercises,
    workoutNotes: session.workoutNotes,
    workoutDate: session.workoutDate,
    workoutStartedAt: session.workoutStartedAt,
    sessionMode: session.sessionMode,
    expandedExerciseId: session.expandedExerciseId,
    restTimer: session.restTimer,
    isSaving: session.isSaving,
  }), [
    session.activeExercises,
    session.workoutNotes,
    session.workoutDate,
    session.workoutStartedAt,
    session.sessionMode,
    session.expandedExerciseId,
    session.restTimer,
    session.isSaving,
  ]);

  const status = useMemo<WorkoutSessionStatus>(() => ({
    hasActiveSession: session.hasActiveSession,
    isActiveLive: session.isActiveLive,
    isActiveManual: session.isActiveManual,
  }), [
    session.hasActiveSession,
    session.isActiveLive,
    session.isActiveManual,
  ]);

  const actions = useMemo<WorkoutSessionActions>(() => ({
    setWorkoutNotes: session.setWorkoutNotes,
    setWorkoutDate: session.setWorkoutDate,
    setSessionMode: session.setSessionMode,
    addExercise: session.addExercise,
    removeExercise: session.removeExercise,
    updateSet: session.updateSet,
    addSet: session.addSet,
    removeSet: session.removeSet,
    finishWorkout: session.finishWorkout,
    markExerciseAsCompleted: session.markExerciseAsCompleted,
    removeIncompleteSets: session.removeIncompleteSets,
    setExpandedExerciseId: session.setExpandedExerciseId,
    startRestTimer: session.startRestTimer,
    clearRestTimer: session.clearRestTimer,
    updateExerciseNotes: session.updateExerciseNotes,
    clearSession: session.clearSession,
    startWorkoutFromTemplate: session.startWorkoutFromTemplate,
    combineExercises: session.combineExercises,
    uncombineSuperset: session.uncombineSuperset,
  }), [
    session.setWorkoutNotes,
    session.setWorkoutDate,
    session.setSessionMode,
    session.addExercise,
    session.removeExercise,
    session.updateSet,
    session.addSet,
    session.removeSet,
    session.finishWorkout,
    session.markExerciseAsCompleted,
    session.removeIncompleteSets,
    session.setExpandedExerciseId,
    session.startRestTimer,
    session.clearRestTimer,
    session.updateExerciseNotes,
    session.clearSession,
    session.startWorkoutFromTemplate,
    session.combineExercises,
    session.uncombineSuperset,
  ]);

  const compatibilityValue = useMemo<WorkoutSessionContextType>(() => ({
    ...state,
    ...status,
    ...actions,
  }), [state, status, actions]);

  return (
    <WorkoutSessionContext.Provider value={compatibilityValue}>
      <WorkoutSessionStateContext.Provider value={state}>
        <WorkoutSessionStatusContext.Provider value={status}>
          <WorkoutSessionActionsContext.Provider value={actions}>
            {children}
          </WorkoutSessionActionsContext.Provider>
        </WorkoutSessionStatusContext.Provider>
      </WorkoutSessionStateContext.Provider>
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

export const useWorkoutSessionState = () => {
  const context = useContext(WorkoutSessionStateContext);
  if (context === undefined) {
    throw new Error('useWorkoutSessionState must be used within a WorkoutSessionProvider');
  }
  return context;
};

export const useWorkoutSessionStatus = () => {
  const context = useContext(WorkoutSessionStatusContext);
  if (context === undefined) {
    throw new Error('useWorkoutSessionStatus must be used within a WorkoutSessionProvider');
  }
  return context;
};

export const useWorkoutSessionActions = () => {
  const context = useContext(WorkoutSessionActionsContext);
  if (context === undefined) {
    throw new Error('useWorkoutSessionActions must be used within a WorkoutSessionProvider');
  }
  return context;
};
