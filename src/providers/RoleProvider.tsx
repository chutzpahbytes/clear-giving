'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_ROLE, ROLE_CONFIG, isRole, type Role } from '@/types/roles';
import { useAccessibility } from '@/providers/AccessibilityProvider';

const ROLE_STORAGE_KEY = 'sphinx.role.v1';

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const { announce } = useAccessibility();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
      if (isRole(saved)) setRoleState(saved);
    } catch {
      /* ignore: default role is used */
    }
  }, []);

  const setRole = useCallback(
    (next: Role) => {
      setRoleState(next);
      try {
        window.localStorage.setItem(ROLE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      announce(`Now viewing as ${ROLE_CONFIG[next].label}. ${ROLE_CONFIG[next].summary}`);
    },
    [announce],
  );

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used inside <RoleProvider>.');
  }
  return context;
}