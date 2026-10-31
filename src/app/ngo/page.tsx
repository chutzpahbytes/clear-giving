'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  Layers,
  MapPin,
  Plus,
  ShieldCheck,
  UploadCloud,
  Wallet,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatRupees } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function NgoDashboardPage() {
  const { state } = useAppState();

  // Find Jal Seva Foundation (our hero NGO)
  const heroNgo = state.ngos.find((n) => n.id === 'ngo-jal-seva') || state.ngos[0];
  const ngoCampaigns = state.campaigns.filter((c) => c.ngoId === heroNgo.id);

  const totalRaised = ngoCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const totalReleased = ngoCampaigns.reduce((sum, c) => sum + c.releasedAmount, 0);
  const totalHeld = ngoCampaigns.reduce((sum, c) => sum + c.heldAmount, 0);

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="ngo" />

      {/* Header & Actions */}
      <section aria-labelledby="ngo-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
                NGO Portal
              </span>
              <span className="text-xs text-muted">Reg: {heroNgo.registrationNumber}</span>
            </div>
            <h1 id="ngo-title" className="text-3xl font-bold mt-1">
              {heroNgo.name} — Charity Dashboard
            </h1>
            <p className="text-muted text-sm max-w-2xl mt-0.5">
              {heroNgo.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/campaigns/new" className="btn btn-primary text-xs sm:text-sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Start New Campaign</span>
            </Link>
            <Link href="/ngo/proof" className="btn btn-secondary text-xs sm:text-sm">
              <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Submit Stage Proof</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Passport & Escrow Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-1">
          <span className="text-xs font-semibold text-primary block">Trust Score</span>
          <p className="text-2xl font-bold text-primary">{heroNgo.trustPassport.score}/100</p>
          <span className="text-[11px] text-muted">Higher score draws faster panels</span>
        </div>

        <div className="rounded-xl border-2 border-line bg-surface p-4 space-y-1">
          <span className="text-xs font-semibold text-muted block">Total Raised Across Projects</span>
          <p className="text-2xl font-bold text-ink">{formatRupees(totalRaised)}</p>
          <span className="text-[11px] text-muted">{ngoCampaigns.length} campaigns listed</span>
        </div>

        <div className="rounded-xl border-2 border-success bg-success/5 p-4 space-y-1">
          <span className="text-xs font-semibold text-success block">Disbursed to Bank</span>
          <p className="text-2xl font-bold text-success">{formatRupees(totalReleased)}</p>
          <span className="text-[11px] text-muted">Audited &amp; paid out</span>
        </div>

        <div className="rounded-xl border-2 border-line bg-surface p-4 space-y-1">
          <span className="text-xs font-semibold text-muted block">Remaining in Safe Escrow</span>
          <p className="text-2xl font-bold text-ink">{formatRupees(totalHeld)}</p>
          <span className="text-[11px] text-muted">Unlocks on next stage audits</span>
        </div>
      </div>

      {/* My Campaigns List */}
      <section aria-labelledby="campaigns-list-heading" className="space-y-4">
        <h2 id="campaigns-list-heading" className="text-xl font-bold">
          Active Campaigns &amp; Escrow Milestones
        </h2>

        <div className="space-y-4">
          {ngoCampaigns.map((camp) => {
            const percent = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));

            return (
              <div
                key={camp.id}
                className="rounded-xl border-2 border-line bg-surface p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase text-primary">
                        {camp.category}
                      </span>
                      <span className="text-xs text-muted font-semibold">
                        Deadline: {camp.deadline}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink mt-1">{camp.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/ngo/proof"
                      className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>Upload Proof</span>
                    </Link>
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <span>View Live Stage</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">
                      Raised: <strong>{formatRupees(camp.raisedAmount)}</strong> of {formatRupees(camp.goalAmount)}
                    </span>
                    <span className="font-bold text-primary">{percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line/20">
                    <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                {/* Sequential Stage Pills */}
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 pt-2">
                  {camp.milestones.map((ms) => {
                    const isReleased = ms.status === 'released';
                    const isChallenge = ms.status === 'approved_in_challenge';
                    const isUnderReview = ms.status === 'under_review';

                    return (
                      <div
                        key={ms.id}
                        className={`rounded-lg border p-3 text-xs ${
                          isReleased
                            ? 'border-success/60 bg-success/5'
                            : isChallenge
                            ? 'border-warning/60 bg-warning/5'
                            : isUnderReview
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-line/40 bg-bg'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-muted">Stage {ms.order}</span>
                          <span className="font-bold text-ink">{formatRupees(ms.targetAmount)}</span>
                        </div>
                        <p className="mt-1 font-semibold text-ink truncate">{ms.title}</p>
                        <span className="mt-2 block capitalize text-[10px] font-bold text-muted">
                          {ms.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
