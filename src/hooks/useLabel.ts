'use client';

import { useCallback } from 'react';
import { LABELS, type LabelKey } from '@/lib/labels';
import { useAccessibility } from '@/providers/AccessibilityProvider';

/** Usage: const t = useLabel();  ...  <p>{t('escrow')}</p> */
export function useLabel() {
  const { settings } = useAccessibility();
  return useCallback((key: LabelKey): string => LABELS[key][settings.language], [settings.language]);
}