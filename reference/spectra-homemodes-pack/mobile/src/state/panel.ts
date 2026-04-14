import React, { createContext, useContext, useReducer, useMemo } from 'react';

export type PanelType = 'visit_detail' | 'mix_detail';

export interface PanelState {
  isOpen: boolean;
  panelType: PanelType | null;
  entityId: string | null;
}

type PanelAction =
  | { type: 'OPEN_PANEL'; panelType: PanelType; entityId: string }
  | { type: 'CLOSE_PANEL' };

const initialState: PanelState = {
  isOpen: false,
  panelType: null,
  entityId: null,
};

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'OPEN_PANEL':
      if (state.isOpen) return state;
      return {
        isOpen: true,
        panelType: action.panelType,
        entityId: action.entityId,
      };
    case 'CLOSE_PANEL':
      return initialState;
    default:
      return state;
  }
}

interface PanelContextValue {
  state: PanelState;
  dispatch: React.Dispatch<PanelAction>;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(panelReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return React.createElement(PanelContext.Provider, { value }, children);
}

export function usePanel(): PanelContextValue {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error('usePanel must be used within PanelProvider');
  return ctx;
}
