'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Percent,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Zap,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { useLabel } from '@/hooks/useLabel';
import type { Auditor } from '@/types/models';

export function AuditorIntegrityPanel() {
  const { state, heroCampaign, actions } = useAppState();
  const t = useLabel();
  const [selectedAuditor, setSelectedAuditor] = useState<Auditor | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const auditors = state.auditors || [];
  const heroStage2 = heroCampaign?.milestones.find((m) => m.id === 'ms-hero-2');
  const hasCanaryInStage2 = heroStage2?.evidence.some((e) => e.isCanary);

  // Trigger canary injection
  const handleInjectCanary = () => {
    try {
      actions.injectCanaryProof(
        'camp-hero',
        'ms-hero-2',
        'Secret Integrity Canary: Altered Submersible Pump Specs'
      );
      setNotification(
        'Canary injected successfully into Stage 2! It has synthetic diffusion artifacts, a 900km GPS variance, and an inflated invoice. Any auditor who rubber-stamps it will be automatically flagged.'
      );
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : 'Error injecting canary');
    }
  };

  // Simulate rubber-stamping auditor (#A4) blindly voting approve on canary
  const handleSimulateRubberStamp = () => {
    try {
      actions.castVote('camp-hero', 'ms-hero-2', 'auditor-4', 'approve', {
        reviewSeconds: 12,
        openedAllEvidence: false,
        checklistAnswers: [
          { criterionId: 'crit-2-1', question: 'Pump model matches specs', satisfied: true },
          { criterionId: 'crit-2-2', question: 'State lab test potability', satisfied: true },
          { criterionId: 'crit-2-3', question: 'Geotag matches target school', satisfied: true },
        ],
        comments: 'Looks good to me, approved.',
      });
      setNotification(
        'TRAP TRIGGERED! Auditor #A4 approved the secret canary without verifying evidence. Auditor #A4 is now FLAGGED and SUSPENDED from all escrow panels!'
      );
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : 'Error simulating vote');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Strategic Rationale */}
      <div className="rounded-xl border-2 border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-warning" aria-hidden="true" />
              <h2 className="text-xl font-bold">Auditor Integrity & Anti-Collusion Engine</h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              Continuous vigilance monitoring across the 7-auditor pseudonymous pool. Detects rubber-stamping,
              speed-voting, and collusion clusters.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleInjectCanary}
              disabled={hasCanaryInStage2}
              className="btn btn-secondary text-sm"
              title="Slip a secret synthetic test proof into the audit queue"
            >
              <Zap className="h-4 w-4 text-warning" aria-hidden="true" />
              <span>{hasCanaryInStage2 ? 'Canary Injected in Stage 2' : 'Inject Secret Canary Proof'}</span>
            </button>
            {hasCanaryInStage2 && (
              <button
                type="button"
                onClick={handleSimulateRubberStamp}
                className="btn btn-primary text-sm"
                title="Simulate Auditor #A4 rubber-stamping the canary proof"
              >
                <AlertOctagon className="h-4 w-4 text-danger" aria-hidden="true" />
                <span>Test Rubber-Stamp Trap (Auditor #A4)</span>
              </button>
            )}
          </div>
        </div>

        {notification && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-lg border-2 border-primary bg-primary/10 p-3 text-sm"
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">{notification}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Auditor Pool Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {auditors.map((auditor) => {
          const stats = auditor.integrityStats;
          const isSuspended = auditor.status === 'suspended' || auditor.isCanaryFlagged;
          const isSpeedVoter = stats.avgReviewSeconds < 20;
          const isHighApproval = stats.approvalRate >= 90;
          const isSelected = selectedAuditor?.id === auditor.id;

          return (
            <div
              key={auditor.id}
              className={`rounded-xl border-2 p-4 transition-all ${
                isSuspended
                  ? 'border-danger bg-danger/5'
                  : isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-line bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-ink">
                      {auditor.pseudonym}
                    </span>
                    <span className="text-xs text-muted">({auditor.specialty})</span>
                  </div>
                  <span className="text-xs font-mono text-muted">{auditor.walletAddress}</span>
                </div>
                <div className="text-right">
                  {isSuspended ? (
                    <span className="inline-flex items-center gap-1 rounded bg-danger px-2 py-0.5 text-xs font-bold text-white">
                      <UserX className="h-3 w-3" aria-hidden="true" />
                      SUSPENDED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-success/20 px-2 py-0.5 text-xs font-bold text-success">
                      <UserCheck className="h-3 w-3" aria-hidden="true" />
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Stat metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-line/60 bg-bg p-2">
                  <div className="flex items-center gap-1 text-muted">
                    <Percent className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Approval Rate</span>
                  </div>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      isHighApproval ? 'text-warning' : 'text-ink'
                    }`}
                  >
                    {stats.approvalRate}%
                  </p>
                </div>

                <div className="rounded-lg border border-line/60 bg-bg p-2">
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Avg Review Speed</span>
                  </div>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      isSpeedVoter ? 'text-danger' : 'text-ink'
                    }`}
                  >
                    {stats.avgReviewSeconds}s
                  </p>
                </div>
              </div>

              {/* Risk Flags */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {auditor.isCanaryFlagged && (
                  <span className="inline-flex items-center gap-1 rounded border border-danger bg-danger/20 px-2 py-0.5 font-bold text-danger">
                    <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
                    CANARY CAUGHT
                  </span>
                )}
                {isSpeedVoter && !auditor.isCanaryFlagged && (
                  <span className="inline-flex items-center gap-1 rounded border border-warning bg-warning/20 px-2 py-0.5 font-bold text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Speed Reviewer (&lt;20s)
                  </span>
                )}
                {isHighApproval && !auditor.isCanaryFlagged && (
                  <span className="inline-flex items-center gap-1 rounded border border-warning bg-warning/20 px-2 py-0.5 font-bold text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    High Approval Bias (&gt;90%)
                  </span>
                )}
                {!isSpeedVoter && !isHighApproval && !isSuspended && (
                  <span className="inline-flex items-center gap-1 rounded border border-success/40 bg-success/10 px-2 py-0.5 font-bold text-success">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Clean Audit Record
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedAuditor(isSelected ? null : auditor)}
                  className="btn btn-secondary text-xs py-1 px-2.5"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isSelected ? 'Hide Agreement' : 'Pairwise Matrix'}</span>
                </button>
                <span className="text-xs text-muted">
                  {auditor.declaredConflicts?.length || 0} conflicts declared
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pairwise Agreement Deep Dive */}
      {selectedAuditor && (
        <div className="rounded-xl border-2 border-primary bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-bold">
                Pairwise Voting Correlation: {selectedAuditor.pseudonym}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAuditor(null)}
              className="text-xs font-semibold underline text-muted"
            >
              Close
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Measures how frequently two auditors vote identically across historical stages. Statistical
            agreement &gt;85% triggers automatic review for potential off-chain collusion.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {auditors
              .filter((a) => a.id !== selectedAuditor.id)
              .map((partner) => {
                const agreement = selectedAuditor.integrityStats.pairAgreement[partner.id] || 50;
                const isHighCorrelation = agreement >= 85;

                return (
                  <div
                    key={partner.id}
                    className={`rounded-lg border p-3 ${
                      isHighCorrelation
                        ? 'border-warning bg-warning/10'
                        : 'border-line/60 bg-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{partner.pseudonym}</span>
                      <span
                        className={`text-sm font-bold ${
                          isHighCorrelation ? 'text-warning' : 'text-ink'
                        }`}
                      >
                        {agreement}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/20">
                      <div
                        className={`h-full ${
                          isHighCorrelation ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${agreement}%` }}
                      />
                    </div>
                    {isHighCorrelation && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-warning">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Collusion cluster flag
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Canary Trap Information Callout */}
      <div className="rounded-xl border-2 border-line bg-surface p-4 text-xs text-muted">
        <h4 className="font-bold text-ink text-sm">How Canary Proofs Defeat Collusion</h4>
        <p className="mt-1">
          Colluders often bribe auditors to approve whatever is submitted. Clear Giving defeats this by
          secretly slipping synthetic canary proofs into random stages. Because colluding auditors cannot
          differentiate a canary proof from genuine submissions, approving blindly guarantees instant detection,
          pool suspension, and stake forfeiture.
        </p>
      </div>
    </div>
  );
}
