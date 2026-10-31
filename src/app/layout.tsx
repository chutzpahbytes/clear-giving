import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';
import { AppShell } from '@/components/AppShell';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_TAGLINE,
};

// Zoom is deliberately NOT disabled, so users can pinch-zoom.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before the page paints so saved text size / contrast apply instantly (no flicker).
 * Key and attribute names must match AccessibilityProvider.tsx.
 */
const settingsScript = `(function(){try{
var d=document.documentElement;
var s=JSON.parse(localStorage.getItem('sphinx.a11y.v1')||'null')||{};
var hc=window.matchMedia('(prefers-contrast: more)').matches;
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
d.dataset.textScale=String(s.textScale||100);
d.dataset.contrast=s.contrast||(hc?'high':'standard');
d.dataset.motion=s.motion||(rm?'reduce':'full');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
      </head>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}