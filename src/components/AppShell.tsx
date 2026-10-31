'use client';

import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Accessibility,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Cpu,
  Globe,
  Heart,
  Layers,
  Link as LinkIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AccessibilityBar } from '@/components/AccessibilityBar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';
import { ROLE_CONFIG, type Role } from '@/types/roles';
import { useRole } from '@/providers/RoleProvider';
import { useAppState } from '@/providers/AppStateProvider';

const ROLE_BADGE_STYLES: Record<Role, { bg: string; text: string; icon: React.ReactNode }> = {
  donor: {
    bg: 'bg-primary/10 border-primary/30',
    text: 'text-primary',
    icon: <Heart className="h-3.5 w-3.5 text-primary" aria-hidden="true" />,
  },
  ngo: {
    bg: 'bg-warning/10 border-warning/30',
    text: 'text-warning',
    icon: <Briefcase className="h-3.5 w-3.5 text-warning" aria-hidden="true" />,
  },
  auditor: {
    bg: 'bg-success/10 border-success/30',
    text: 'text-success',
    icon: <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />,
  },
  admin: {
    bg: 'bg-danger/10 border-danger/30',
    text: 'text-danger',
    icon: <Shield className="h-3.5 w-3.5 text-danger" aria-hidden="true" />,
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { role } = useRole();
  const { isChainMode, toggleChainMode } = useAppState();
  const config = ROLE_CONFIG[role];
  const items = [{ href: '/', label: 'Home' }, ...config.nav];
  const badge = ROLE_BADGE_STYLES[role];

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Collapsible Accessible Control Bar */}
      <AccessibilityBar />

      {/* Primary Header */}
      <header className="border-b-2 border-line bg-surface sticky top-[42px] z-30 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="no-underline flex items-center gap-2.5">
              <div className="rounded-xl bg-primary p-2 text-primary-fg shadow-sm">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-xl font-bold leading-tight tracking-tight text-ink">
                  {APP_NAME}
                </span>
                <span className="block text-xs font-semibold text-muted">
                  {APP_TAGLINE}
                </span>
              </div>
            </Link>

            {/* Chain Mode & Role Switcher Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Chain Mode Toggle (Simulator vs Polygon Amoy) */}
              <button
                type="button"
                onClick={toggleChainMode}
                className={`btn text-xs py-1 px-2.5 flex items-center gap-1.5 rounded-lg border-2 transition-all ${
                  isChainMode
                    ? 'border-purple-600 bg-purple-600/10 text-purple-700 font-bold'
                    : 'border-line bg-surface text-muted hover:text-ink'
                }`}
                title="Preview of the planned switch to a blockchain. The demo currently runs on the simulator."
              >
                {isChainMode ? (
                  <>
                    <Globe className="h-3.5 w-3.5 text-purple-600 animate-pulse" aria-hidden="true" />
                    <span>Chain preview (not connected yet)</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    <span>Simulator Mode (Instant)</span>
                  </>
                )}
              </button>

              <RoleSwitcher />
            </div>
          </div>

          {/* Role Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/30 pt-2">
            <nav aria-label={`${config.label} menu`}>
              <ul className="flex flex-wrap gap-1 sm:gap-2">
                {items.map((item) => {
                  const current = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={current ? 'page' : undefined}
                        className={`inline-flex min-h-[2.25rem] items-center rounded-lg px-3 py-1 text-xs sm:text-sm font-semibold transition-colors ${
                          current
                            ? 'bg-primary text-primary-fg shadow-xs'
                            : 'text-muted hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Active Role Indicator Badge */}
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${badge.bg} ${badge.text}`}
              >
                {badge.icon}
                <span>Role: {config.label}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-line bg-surface py-5 mt-auto">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-muted">
          <p>
            <strong>Clear Giving (SPHINX &apos;26)</strong> — Transparent Milestone Charity Escrow.
            Separation of powers guaranteed by verifiable smart contract rules.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/audit" className="hover:text-primary underline">
              Public Ledger
            </Link>
            <Link href="/admin/demo" className="hover:text-primary underline">
              Demo Test Bench
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}