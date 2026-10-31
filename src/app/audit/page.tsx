'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Filter,
  History,
  Layers,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatDateTime, formatRupees } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';
import type { AuditEventType } from '@/types/models';

export default function FollowTheMoneyPage() {
  const { state, totalRaised, totalHeld, totalReleased, totalRetained } = useAppState();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const events = state.auditEvents.filter((ev) => {
    const matchesFilter = filterType === 'all' || ev.type === filterType;
    const matchesSearch =
      ev.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="donor" />

      {/* Header */}
      <section aria-labelledby="audit-title" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 id="audit-title" className="text-3xl font-bold">
              Follow the Money: Public Audit Ledger
            </h1>
            <p className="text-muted text-base max-w-3xl">
              An unalterable, transparent log of every donation, proof submission, blind vote, payout,
              and 48-hour challenge event across all active escrow vaults.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border-2 border-line bg-surface px-3 py-2 text-xs font-semibold">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Simulated Ledger Clock: {formatDateTime(state.simulatedNow)}</span>
          </div>
        </div>
      </section>

      {/* Financial Health Ribbon */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-2 border-line bg-surface p-4">
          <span className="text-xs text-muted block">Total Raised Across Causes</span>
          <p className="text-2xl font-bold text-ink mt-1">{formatRupees(totalRaised)}</p>
          <span className="text-[11px] text-muted">100% accounted for</span>
        </div>

        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <span className="text-xs text-primary block font-semibold">Held in Smart Escrow</span>
          <p className="text-2xl font-bold text-primary mt-1">{formatRupees(totalHeld)}</p>
          <span className="text-[11px] text-muted">Locked in multi-sig vault</span>
        </div>

        <div className="rounded-xl border-2 border-success bg-success/5 p-4">
          <span className="text-xs text-success block font-semibold">Released Post-Audit (80%)</span>
          <p className="text-2xl font-bold text-success mt-1">{formatRupees(totalReleased)}</p>
          <span className="text-[11px] text-muted">Audited &amp; disbursed</span>
        </div>

        <div className="rounded-xl border-2 border-warning bg-warning/5 p-4">
          <span className="text-xs text-warning block font-semibold">In 48h Retention (20%)</span>
          <p className="text-2xl font-bold text-warning mt-1">{formatRupees(totalRetained)}</p>
          <span className="text-[11px] text-muted">Public dispute challenge</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-line bg-surface p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Actions' },
            { id: 'VOTE_CAST', label: 'Votes' },
            { id: 'STAGE_APPROVED', label: 'Milestone Releases' },
            { id: 'PROOF_SUBMITTED', label: 'Evidence Uploads' },
            { id: 'DONATION', label: 'Donations' },
            { id: 'CANARY_INJECTED', label: 'Canary Alerts' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterType(cat.id)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${
                filterType === cat.id
                  ? 'bg-primary text-primary-fg'
                  : 'bg-bg text-muted hover:text-ink border border-line/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-2 border-line bg-bg py-1.5 pl-9 pr-3 text-xs font-medium focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <section aria-labelledby="ledger-table-heading" className="space-y-3">
        <h2 id="ledger-table-heading" className="text-lg font-bold">
          {events.length} Historical Blockchain Audit Events
        </h2>

        <div className="overflow-x-auto rounded-xl border-2 border-line bg-surface">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-bg font-bold text-muted">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Actor / Entity</th>
                <th className="p-3">Details &amp; Invariants Enforced</th>
                <th className="p-3">Transaction CID / TxHash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30">
              {events.map((ev) => {
                const isCanary = ev.type === 'CANARY_INJECTED';
                const isRelease = ev.type === 'STAGE_APPROVED' || ev.type === 'FUNDS_RELEASED';
                const isVote = ev.type === 'VOTE_CAST';

                return (
                  <tr
                    key={ev.id}
                    className={`hover:bg-bg/50 transition-colors ${
                      isCanary ? 'bg-danger/5' : isRelease ? 'bg-success/5' : ''
                    }`}
                  >
                    <td className="p-3 whitespace-nowrap text-muted font-mono">
                      {formatDateTime(ev.timestamp)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 font-bold uppercase text-[10px] ${
                          isCanary
                            ? 'bg-danger/20 text-danger border border-danger'
                            : isRelease
                            ? 'bg-success/20 text-success'
                            : isVote
                            ? 'bg-primary/20 text-primary'
                            : 'bg-line/20 text-muted'
                        }`}
                      >
                        {ev.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-ink">
                      {ev.actorName} ({ev.actorRole})
                    </td>
                    <td className="p-3 leading-relaxed text-ink/90 max-w-md">
                      {ev.details}
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-muted text-[11px]">
                      {ev.txHash.slice(0, 12)}...{ev.txHash.slice(-6)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
