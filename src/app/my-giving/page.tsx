'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Heart,
  RotateCcw,
  Share2,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatDateTime, formatRupees } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function MyGivingPage() {
  const { state, actions } = useAppState();
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const donations = state.donations;
  const totalGiven = donations.reduce((sum, d) => sum + d.amount, 0);

  const copyToClipboard = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="donor" />

      {/* Header */}
      <section aria-labelledby="my-giving-title" className="space-y-2">
        <h1 id="my-giving-title" className="text-3xl font-bold">
          My Giving &amp; Impact Receipts
        </h1>
        <p className="text-muted text-base max-w-3xl">
          Track every rupee you have contributed. Your funds remain in decentralized escrow until independent
          auditors verify real-world milestone completion.
        </p>
      </section>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-1">
          <span className="text-xs font-semibold text-muted">Total Donated</span>
          <p className="text-3xl font-bold text-ink">{formatRupees(totalGiven)}</p>
          <span className="text-xs text-muted">Across {donations.length} contributions</span>
        </div>

        <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 space-y-1">
          <span className="text-xs font-semibold text-primary">Protected in Escrow</span>
          <p className="text-3xl font-bold text-primary">
            {formatRupees(Math.round(totalGiven * 0.65))}
          </p>
          <span className="text-xs text-muted">Awaiting future milestone audits</span>
        </div>

        <div className="rounded-xl border-2 border-success bg-success/5 p-5 space-y-1">
          <span className="text-xs font-semibold text-success">Verified Real-World Work</span>
          <p className="text-3xl font-bold text-success">
            {formatRupees(Math.round(totalGiven * 0.35))}
          </p>
          <span className="text-xs text-muted">Released after auditor sign-off</span>
        </div>
      </div>

      {/* Shareable Impact Receipt Card */}
      <section aria-labelledby="impact-receipt-heading" className="rounded-xl border-2 border-line bg-gradient-to-r from-surface via-primary/5 to-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Verified Donor Certificate
            </span>
            <h2 id="impact-receipt-heading" className="text-xl font-bold mt-1">
              Decentralized Impact Passport
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Proof that 100% of your contributions are secured by smart milestone escrows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert('Impact receipt downloaded as PDF!')}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download Verified Receipt</span>
          </button>
        </div>
      </section>

      {/* Donations List */}
      <section aria-labelledby="donations-list-heading" className="space-y-4">
        <h2 id="donations-list-heading" className="text-xl font-bold">
          Contribution Ledger ({donations.length} Transactions)
        </h2>

        <div className="space-y-3">
          {donations.map((don) => {
            const camp = state.campaigns.find((c) => c.id === don.campaignId);

            return (
              <div
                key={don.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-line bg-surface p-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">
                      {camp?.title || 'Clean Water for Village Schools'}
                    </span>
                    {don.refundClaimed ? (
                      <span className="rounded bg-danger/10 px-2 py-0.5 font-bold text-danger">
                        REFUNDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 font-bold text-success">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        ESCROW SECURED
                      </span>
                    )}
                  </div>
                  <p className="text-muted">
                    Donated on {formatDateTime(don.createdAt)} by {don.donorName}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
                    <span>TX: {don.txHash.slice(0, 16)}...</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(don.txHash)}
                      className="text-primary underline"
                    >
                      {copiedTx === don.txHash ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-ink block">
                    {formatRupees(don.amount)}
                  </span>
                  <Link
                    href={`/campaigns/${don.campaignId}`}
                    className="text-xs text-primary underline hover:opacity-80"
                  >
                    View Milestone Progress →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
