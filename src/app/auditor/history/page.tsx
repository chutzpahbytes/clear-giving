'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatDateTime } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function AuditorHistoryPage() {
  const { state } = useAppState();

  const currentAuditor = state.auditors.find((a) => a.id === 'auditor-1') || state.auditors[0];

  // Collect all votes cast by this auditor across all campaigns
  const myVotes: Array<{
    campaignTitle: string;
    milestoneTitle: string;
    decision: 'approve' | 'reject';
    comments?: string;
    reviewSeconds: number;
    createdAt: string;
  }> = [];

  state.campaigns.forEach((camp) => {
    camp.milestones.forEach((ms) => {
      ms.votes.forEach((v) => {
        if (v.auditorId === currentAuditor.id) {
          myVotes.push({
            campaignTitle: camp.title,
            milestoneTitle: ms.title,
            decision: v.decision,
            comments: v.comments,
            reviewSeconds: v.reviewSeconds,
            createdAt: v.createdAt,
          });
        }
      });
    });
  });

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="auditor" />

      {/* Top Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/auditor" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Proof Queue</span>
        </Link>
        <span className="font-mono text-xs font-bold text-primary">
          Auditor ID: {currentAuditor.pseudonym}
        </span>
      </div>

      <section aria-labelledby="history-title" className="space-y-2">
        <h1 id="history-title" className="text-3xl font-bold">
          My Past Votes &amp; Audit Trail
        </h1>
        <p className="text-muted text-sm max-w-3xl">
          Historical record of your blind votes across milestone escrow stages. Your decisions are recorded
          pseudonymously on the public audit ledger.
        </p>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-line bg-surface p-4">
          <span className="text-xs text-muted block">Total Votes Cast</span>
          <p className="text-2xl font-bold text-ink mt-1">{myVotes.length}</p>
          <span className="text-[11px] text-muted">Across all assigned panels</span>
        </div>

        <div className="rounded-xl border-2 border-line bg-surface p-4">
          <span className="text-xs text-muted block">Historical Approval Rate</span>
          <p className="text-2xl font-bold text-primary mt-1">
            {currentAuditor.integrityStats.approvalRate}%
          </p>
          <span className="text-[11px] text-muted">Platform average: 75%</span>
        </div>

        <div className="rounded-xl border-2 border-line bg-surface p-4">
          <span className="text-xs text-muted block">Average Review Scrutiny</span>
          <p className="text-2xl font-bold text-success mt-1">
            {currentAuditor.integrityStats.avgReviewSeconds}s
          </p>
          <span className="text-[11px] text-muted">Passes &gt;15s vigilance requirement</span>
        </div>
      </div>

      {/* Votes List */}
      <section aria-labelledby="votes-list-heading" className="space-y-3">
        <h2 id="votes-list-heading" className="text-lg font-bold">
          Voting History
        </h2>

        {myVotes.length === 0 ? (
          <div className="rounded-xl border-2 border-line bg-surface p-8 text-center text-muted">
            No votes recorded yet. Head to the{' '}
            <Link href="/auditor" className="text-primary underline font-bold">
              Proof Queue
            </Link>{' '}
            to inspect active stage proofs.
          </div>
        ) : (
          <div className="space-y-3">
            {myVotes.map((vote, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-line bg-surface p-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{vote.milestoneTitle}</span>
                    <span className="text-muted">({vote.campaignTitle})</span>
                    {vote.decision === 'approve' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-success/20 px-2 py-0.5 font-bold text-success">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        APPROVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-danger/20 px-2 py-0.5 font-bold text-danger">
                        <XCircle className="h-3 w-3" aria-hidden="true" />
                        REJECTED
                      </span>
                    )}
                  </div>
                  <p className="text-ink/80 italic">&ldquo;{vote.comments}&rdquo;</p>
                  <p className="text-muted text-[11px]">
                    Reviewed on {formatDateTime(vote.createdAt)} • Scrutiny time: {vote.reviewSeconds} seconds
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
