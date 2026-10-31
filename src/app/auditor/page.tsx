'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileSearch,
  History,
  Lock,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatRupees } from '@/lib/format';
import { EvidenceForensicsViewer } from '@/components/EvidenceForensicsViewer';
import { RolePowersCard } from '@/components/RolePowersCard';
import type { ChecklistAnswer } from '@/types/models';

export default function AuditorQueuePage() {
  const { state, actions } = useAppState();

  // Active auditor identity in sample is Auditor #A1
  const currentAuditor = state.auditors.find((a) => a.id === 'auditor-1') || state.auditors[0];
  const heroCampaign = state.campaigns.find((c) => c.id === 'camp-hero') || state.campaigns[0];
  const heroStage2 = heroCampaign.milestones.find((m) => m.id === 'ms-hero-2') || heroCampaign.milestones[1];

  // Checklist state for Stage 2
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'crit-2-1': false,
    'crit-2-2': false,
    'crit-2-3': false,
  });

  const [openedAllEvidence, setOpenedAllEvidence] = useState(false);
  const [reviewSeconds, setReviewSeconds] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Review timer (enforces 15s minimum scrutiny gate)
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const MIN_REVIEW_SECONDS = 15;
  const isTimeGatePassed = reviewSeconds >= MIN_REVIEW_SECONDS;
  const isChecklistComplete = Object.values(checklist).every(Boolean);
  const isGateUnlocked = isTimeGatePassed && isChecklistComplete && openedAllEvidence;

  const hasAlreadyVoted = heroStage2.votes.some((v) => v.auditorId === currentAuditor.id);
  const isApproved = heroStage2.status === 'approved_in_challenge' || heroStage2.status === 'released';

  const handleVote = (decision: 'approve' | 'reject') => {
    try {
      const answers: ChecklistAnswer[] = [
        { criterionId: 'crit-2-1', question: 'Pump model matches specifications', satisfied: checklist['crit-2-1'] },
        { criterionId: 'crit-2-2', question: 'State lab test confirms potability (IS 10500)', satisfied: checklist['crit-2-2'] },
        { criterionId: 'crit-2-3', question: 'Geotag matches target school', satisfied: checklist['crit-2-3'] },
      ];

      const res = actions.castVote(
        heroCampaign.id,
        heroStage2.id,
        currentAuditor.id,
        decision,
        {
          reviewSeconds,
          openedAllEvidence: true,
          checklistAnswers: answers,
          comments: decisionNotes || (decision === 'approve' ? 'All criteria verified against field photos and lab results.' : 'Deficiencies identified in submitted proof.'),
        }
      );

      if (res.outcome === 'approved') {
        setFeedback(
          `Deciding vote cast! 2-of-3 threshold reached. 80% (${formatRupees(res.immediatePayout || 64000)}) released immediately to Jal Seva Foundation, and 20% (${formatRupees(res.retainedAmount || 16000)}) is retained during the 48-hour challenge window.`
        );
      } else {
        setFeedback(`Vote "${decision.toUpperCase()}" registered successfully into the blind voting vault.`);
      }
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Error casting vote');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="auditor" />

      {/* Auditor Identity Header */}
      <section aria-labelledby="auditor-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold font-mono text-primary uppercase">
                {currentAuditor.pseudonym} (Blind Auditor Session)
              </span>
              <span className="text-xs text-muted">Specialty: {currentAuditor.specialty}</span>
            </div>
            <h1 id="auditor-title" className="text-3xl font-bold mt-1">
              Independent Proof Audit Queue
            </h1>
            <p className="text-muted text-sm max-w-3xl mt-0.5">
              Auditors review evidence under pseudonyms. Votes are blind: you cannot see other panel members&apos;
              votes until your own vote is cast.
            </p>
          </div>

          <Link href="/auditor/history" className="btn btn-secondary text-xs sm:text-sm">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>My Voting Record</span>
          </Link>
        </div>
      </section>

      {feedback && (
        <aside
          role="status"
          aria-live="polite"
          className="flex items-start justify-between gap-4 rounded-xl border-2 border-primary bg-primary/10 p-4 font-semibold text-ink"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
            <p className="text-sm">{feedback}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Active Milestone Review Case */}
      <section aria-labelledby="active-case-heading" className="rounded-xl border-2 border-line bg-surface p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/40 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Active Case: {heroCampaign.title}
            </span>
            <h2 id="active-case-heading" className="text-2xl font-bold mt-1">
              Stage {heroStage2.order}: {heroStage2.title} ({formatRupees(heroStage2.targetAmount)})
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Payout rule: 2 of 3 blind approvals required • 80% immediate release (₹64,000) • 20% retention (₹16,000)
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted block">Blind Panel Progress:</span>
            <span className="text-base font-bold text-ink">
              {isApproved ? 'Approved (Threshold Reached)' : `${heroStage2.votes.length} of 3 votes cast`}
            </span>
          </div>
        </div>

        {/* Evidence Forensics Workbench */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Evidence Workbench (Multi-Layered Automated Scrutiny)</span>
            </h3>
            <button
              type="button"
              onClick={() => setOpenedAllEvidence(true)}
              className="btn btn-secondary text-xs py-1 px-2.5"
            >
              <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Mark All Evidence Inspected</span>
            </button>
          </div>

          <EvidenceForensicsViewer
            evidence={heroStage2.evidence}
            milestone={heroStage2}
          />
        </div>

        {/* Rubber-Stamp Gate & Blind Voting Panel */}
        <div className="rounded-xl border-2 border-primary/30 bg-bg p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/40 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" aria-hidden="true" />
              <h3 className="text-base font-bold text-ink">
                Rubber-Stamp Gate &amp; Verification Checklist
              </h3>
            </div>

            {/* Review Time Tracker */}
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>
                Review time spent: <strong>{reviewSeconds}s</strong>{' '}
                {!isTimeGatePassed && (
                  <span className="text-warning font-semibold">
                    (Min {MIN_REVIEW_SECONDS}s scrutiny gate)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Checklist Criteria */}
          <div className="space-y-2.5">
            <label className="flex items-start gap-3 text-xs font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={checklist['crit-2-1']}
                onChange={(e) =>
                  setChecklist({ ...checklist, 'crit-2-1': e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <span>1. Verified that solar submersible pump model and horsepower match engineering blueprint specifications.</span>
            </label>

            <label className="flex items-start gap-3 text-xs font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={checklist['crit-2-2']}
                onChange={(e) =>
                  setChecklist({ ...checklist, 'crit-2-2': e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <span>2. Verified that State Public Health Engineering lab certificate clears chemical &amp; biological potability (IS 10500 standard).</span>
            </label>

            <label className="flex items-start gap-3 text-xs font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={checklist['crit-2-3']}
                onChange={(e) =>
                  setChecklist({ ...checklist, 'crit-2-3': e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <span>3. Verified that photo EXIF GPS geotag location matches Govt Upper Primary School, Alwar, Rajasthan.</span>
            </label>
          </div>

          {/* Decision Notes */}
          <div>
            <label className="text-xs font-bold text-muted block mb-1">
              Auditor Forensic Observations (Recorded on Immutable Ledger)
            </label>
            <textarea
              rows={2}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="e.g. Pump specifications and water test certificates fully match project requirements..."
              className="w-full rounded-lg border border-line bg-surface p-2 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          {/* Voting Action Buttons */}
          <div className="pt-2 border-t border-line/40 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-muted">
              {!isGateUnlocked ? (
                <span className="flex items-center gap-1.5 text-warning font-semibold">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Voting locked until: {!openedAllEvidence && '1. Open evidence • '}{' '}
                    {!isTimeGatePassed && `2. Spend ${MIN_REVIEW_SECONDS - reviewSeconds}s more reviewing • `}{' '}
                    {!isChecklistComplete && '3. Complete 3 checklist items'}
                  </span>
                </span>
              ) : hasAlreadyVoted ? (
                <span className="text-success font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>You have already cast your blind vote for this stage.</span>
                </span>
              ) : (
                <span className="text-success font-semibold flex items-center gap-1.5">
                  <Unlock className="h-4 w-4" aria-hidden="true" />
                  <span>Scrutiny requirements satisfied. Blind vote unlocked.</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!isGateUnlocked || hasAlreadyVoted}
                onClick={() => handleVote('reject')}
                className="btn btn-secondary text-xs py-2 px-4 border-danger text-danger hover:bg-danger/10"
              >
                Reject Proof (Return to NGO)
              </button>

              <button
                type="button"
                disabled={!isGateUnlocked || hasAlreadyVoted}
                onClick={() => handleVote('approve')}
                className="btn btn-primary text-xs py-2 px-5"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Cast Blind Vote: APPROVE</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
