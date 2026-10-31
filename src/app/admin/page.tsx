'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatRupees } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function AdminOverviewPage() {
  const { state, totalRaised, totalHeld, totalReleased, totalRetained } = useAppState();

  const ngos = state.ngos;
  const auditors = state.auditors;
  const canaryFlaggedAuditors = auditors.filter((a) => a.isCanaryFlagged);
  const activeDisputes = state.campaigns.flatMap((c) =>
    c.milestones.flatMap((m) => m.disputes.filter((d) => d.status === 'pending'))
  );

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="admin" />

      {/* Header & Quick Action Buttons */}
      <section aria-labelledby="admin-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
                Platform Administration
              </span>
              <span className="text-xs text-muted">Smart Contract Governance</span>
            </div>
            <h1 id="admin-title" className="text-3xl font-bold mt-1">
              Escrow Governance &amp; Platform Health
            </h1>
            <p className="text-muted text-sm max-w-3xl mt-0.5">
              Admin manages the auditor pool, monitors systemic fraud flags, and verifies NGOs. Admin
              cannot touch or release escrow funds under any circumstance (enforced by contract rules).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/auditors" className="btn btn-primary text-xs sm:text-sm">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>Auditor Integrity &amp; Canary Panel</span>
            </Link>
            <Link href="/admin/demo" className="btn btn-secondary text-xs sm:text-sm">
              <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Demo Console</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Escrow Balances Ribbon */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-2 border-line bg-surface p-4">
          <span className="text-xs font-semibold text-muted block">Total Platform Donations</span>
          <p className="text-2xl font-bold text-ink mt-1">{formatRupees(totalRaised)}</p>
          <span className="text-[11px] text-muted">Across all charity escrow vaults</span>
        </div>

        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <span className="text-xs font-semibold text-primary block">Safely Held in Escrow</span>
          <p className="text-2xl font-bold text-primary mt-1">{formatRupees(totalHeld)}</p>
          <span className="text-[11px] text-muted">Locked until stage verification</span>
        </div>

        <div className="rounded-xl border-2 border-success bg-success/5 p-4">
          <span className="text-xs font-semibold text-success block">Total Released Post-Audit</span>
          <p className="text-2xl font-bold text-success mt-1">{formatRupees(totalReleased)}</p>
          <span className="text-[11px] text-muted">Disbursed to verified NGOs</span>
        </div>

        <div className="rounded-xl border-2 border-warning bg-warning/5 p-4">
          <span className="text-xs font-semibold text-warning block">In 48h Retention</span>
          <p className="text-2xl font-bold text-warning mt-1">{formatRupees(totalRetained)}</p>
          <span className="text-[11px] text-muted">Subject to public challenge</span>
        </div>
      </div>

      {/* Integrity & Fraud Alerts Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
              <span>Canary Trap Status</span>
            </h3>
            <Link href="/admin/auditors" className="text-xs text-primary underline font-semibold">
              Manage Canary Injections →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {canaryFlaggedAuditors.length > 0 ? (
              canaryFlaggedAuditors.map((aud) => (
                <div
                  key={aud.id}
                  className="rounded-lg border border-danger/60 bg-danger/10 p-2.5 text-danger font-semibold flex items-center justify-between"
                >
                  <span>{aud.pseudonym} — Suspended for rubber-stamping secret canary proof</span>
                  <span className="rounded bg-danger px-1.5 py-0.5 text-[10px] text-white font-bold">
                    SUSPENDED
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-success/40 bg-success/5 p-3 text-success font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>All 7 auditors currently active with clean vigil records. Zero canary traps triggered.</span>
              </div>
            )}
          </div>
        </div>

        {/* Public Dispute Queue */}
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              <span>Public Challenges &amp; Disputes</span>
            </h3>
            <span className="text-xs font-semibold text-muted">
              {activeDisputes.length} active dispute(s)
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {activeDisputes.length > 0 ? (
              activeDisputes.map((disp) => (
                <div
                  key={disp.id}
                  className="rounded-lg border border-warning/60 bg-warning/10 p-2.5 text-ink space-y-1"
                >
                  <div className="flex justify-between font-bold">
                    <span>Filed by: {disp.filedBy}</span>
                    <span className="text-warning uppercase text-[10px]">5-Auditor Re-Review</span>
                  </div>
                  <p className="text-muted">{disp.reason}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-line/60 bg-bg p-3 text-muted">
                Zero active disputes. All current 48h retention windows proceeding smoothly.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified NGOs Table */}
      <section aria-labelledby="ngos-table-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="ngos-table-heading" className="text-lg font-bold">
            Verified Charity Registries ({ngos.length} Registered NGOs)
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border-2 border-line bg-surface">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-bg font-bold text-muted">
              <tr>
                <th className="p-3">Charity Name</th>
                <th className="p-3">Registration Number</th>
                <th className="p-3">Location</th>
                <th className="p-3">Trust Passport Score</th>
                <th className="p-3">Milestone Track Record</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30">
              {ngos.map((ngo) => (
                <tr key={ngo.id} className="hover:bg-bg/50">
                  <td className="p-3 font-bold text-ink">{ngo.name}</td>
                  <td className="p-3 font-mono text-muted">{ngo.registrationNumber}</td>
                  <td className="p-3 text-muted">{ngo.location}</td>
                  <td className="p-3 font-bold text-primary">
                    {ngo.trustPassport.score}/100
                  </td>
                  <td className="p-3 text-muted">
                    {ngo.trustPassport.completedCampaigns} completed • {ngo.trustPassport.onTimeRate}% on-time
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded bg-success/20 px-2 py-0.5 text-xs font-bold text-success">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
