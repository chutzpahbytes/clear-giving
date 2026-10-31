'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  Layers,
  Plus,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';
import type { LabelKey } from '@/lib/labels';
import { useLabel } from '@/hooks/useLabel';
import { useRole } from '@/providers/RoleProvider';
import { ROLE_CONFIG } from '@/types/roles';
import { useAppState } from '@/providers/AppStateProvider';
import { formatRupees } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';

const PREVIEW_KEYS: LabelKey[] = [
  'connectWallet',
  'escrow',
  'transactionId',
  'proofFile',
  'approveProof',
  'release',
  'demoMode',
];

export default function HomePage() {
  const { role } = useRole();
  const t = useLabel();
  const config = ROLE_CONFIG[role];
  const { heroCampaign, totalHeld, totalReleased, totalRaised } = useAppState();

  const heroStage2 = heroCampaign?.milestones.find((m) => m.id === 'ms-hero-2');
  const stage2VotesCount = heroStage2?.votes.length || 0;
  const isApproved =
    heroStage2?.status === 'approved_in_challenge' || heroStage2?.status === 'released';

  return (
    <div className="space-y-8 pb-12">
      {/* Separation of Powers Trust Boundary Card */}
      <RolePowersCard />

      {/* Hero Welcome Banner */}
      <section aria-labelledby="page-title" className="space-y-2">
        <h1 id="page-title" className="text-3xl sm:text-4xl font-bold text-ink">
          Welcome to {APP_NAME} — {APP_TAGLINE}
        </h1>
        <p className="max-w-3xl text-base text-muted leading-relaxed">
          <strong>Active Mode ({config.label}):</strong> {config.summary}
        </p>
      </section>

      {/* Role Quick Workflow Tiles */}
      <section aria-labelledby="role-workflows-heading" className="space-y-3">
        <h2 id="role-workflows-heading" className="text-lg font-bold">
          Quick Actions for {config.label}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {role === 'donor' && (
            <>
              <Link
                href="/campaigns"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Browse Verified Causes</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Explore verified charities with Trust Passports and escrow milestones.
                </p>
              </Link>
              <Link
                href="/my-giving"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">My Giving &amp; Receipts</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  View your protected contributions, receipts, and refund statuses.
                </p>
              </Link>
              <Link
                href="/audit"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Follow the Money</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Audit every rupee through immutable smart contract ledger events.
                </p>
              </Link>
            </>
          )}

          {role === 'ngo' && (
            <>
              <Link
                href="/ngo"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Charity Dashboard</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  View milestone statuses, Trust Passport, and escrow balance updates.
                </p>
              </Link>
              <Link
                href="/campaigns/new"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Start New Campaign</span>
                  <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Propose sequential stages with evidence checklists and budget allocations.
                </p>
              </Link>
              <Link
                href="/ngo/proof"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Submit Stage Proof</span>
                  <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Upload geotagged field photos, lab reports, and contractor invoices.
                </p>
              </Link>
            </>
          )}

          {role === 'auditor' && (
            <>
              <Link
                href="/auditor"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Proof Review Queue</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Inspect Evidence Workbench signals and cast blind decisions.
                </p>
              </Link>
              <Link
                href="/auditor/history"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">My Past Votes</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Review historical votes, timestamps, and review scrutiny durations.
                </p>
              </Link>
              <Link
                href="/admin/demo"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Testing Console</span>
                  <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Simulate fast-forwarding 48h retentions and donor refunds.
                </p>
              </Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link
                href="/admin"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Platform Overview</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Monitor platform balances, disputes, and verified NGO registrations.
                </p>
              </Link>
              <Link
                href="/admin/auditors"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Auditor Integrity &amp; Canary</span>
                  <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Track pairwise agreement matrix and inject secret canary proofs.
                </p>
              </Link>
              <Link
                href="/admin/demo"
                className="rounded-xl border-2 border-line bg-surface p-4 hover:border-primary transition-all shadow-sm space-y-1 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ink">Interactive Demo Bench</span>
                  <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted">
                  Cast deciding votes, warp time, and test reduced motion.
                </p>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Hero Live Escrow Demonstration Banner */}
      <section className="card border-primary/40 bg-primary/5" aria-labelledby="hero-status-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Live Escrow Demonstration
            </span>
            <h2 id="hero-status-heading" className="text-xl font-bold">
              {heroCampaign?.title} ({formatRupees(heroCampaign?.goalAmount || 500000)} Goal)
            </h2>
          </div>
          <Link href={`/campaigns/${heroCampaign?.id || 'camp-hero'}`} className="btn btn-primary text-xs sm:text-sm">
            <span>Inspect Live Stages</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-line bg-surface p-3">
            <span className="text-xs text-muted">Protected in Escrow:</span>
            <p className="text-lg font-bold text-primary">{formatRupees(totalHeld)}</p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <span className="text-xs text-muted">Paid to Charity:</span>
            <p className="text-lg font-bold text-success">{formatRupees(totalReleased)}</p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <span className="text-xs text-muted">Current Stage:</span>
            <p className="text-sm font-semibold capitalize text-warning">
              Stage 2 ({heroStage2?.status.replace(/_/g, ' ')})
            </p>
          </div>
        </div>
      </section>

      {/* Plain Words Dictionary Check */}
      <section className="card" aria-labelledby="labels-title">
        <h2 id="labels-title" className="text-xl font-bold">
          Plain-Words Dictionary Check
        </h2>
        <p className="mt-1 text-muted text-xs">
          Clear Giving translates complex Web3 and smart contract jargon into clear, everyday terms.
          Switch &quot;Technical terms&quot; in the accessibility bar above to inspect translations.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-xs">
          {PREVIEW_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2 rounded border border-line/40 bg-surface p-2">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
              <span className="font-semibold text-ink">{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}