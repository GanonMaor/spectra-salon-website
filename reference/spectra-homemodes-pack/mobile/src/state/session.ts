import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { StaffRole, HomeMode, SyncState } from '../viewmodels/types';

export interface SessionState {
  activeStaffId: string | null;
  activeRole: StaffRole | null;
  activeMode: HomeMode | null;
  syncState: SyncState;
  resumeTarget: string | null;
}

type SessionAction =
  | { type: 'SET_STAFF'; staffId: string; role: StaffRole }
  | { type: 'SET_MODE'; mode: HomeMode }
  | { type: 'SET_SYNC'; syncState: SyncState }
  | { type: 'CLEAR_SESSION' };

const ROLE_DEFAULT_MODE: Record<StaffRole, HomeMode> = {
  colorbar: 'colorbar',
  reception: 'reception',
  manager: 'manager',
};

const initialState: SessionState = {
  activeStaffId: null,
  activeRole: null,
  activeMode: null,
  syncState: 'synced',
  resumeTarget: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_STAFF':
      return {
        ...state,
        activeStaffId: action.staffId,
        activeRole: action.role,
        activeMode: ROLE_DEFAULT_MODE[action.role],
      };
    case 'SET_MODE':
      return { ...state, activeMode: action.mode };
    case 'SET_SYNC':
      return { ...state, syncState: action.syncState };
    case 'CLEAR_SESSION':
      return initialState;
    default:
      return state;
  }
}

interface SessionContextValue {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return React.createElement(SessionContext.Provider, { value }, children);
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export { ROLE_DEFAULT_MODE };
