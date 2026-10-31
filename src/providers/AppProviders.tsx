'use client';

import type { ReactNode } from 'react';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';
import { RoleProvider } from '@/providers/RoleProvider';
import { AppStateProvider } from '@/providers/AppStateProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AccessibilityProvider>
      <RoleProvider>
        <AppStateProvider>{children}</AppStateProvider>
      </RoleProvider>
    </AccessibilityProvider>
  );
}