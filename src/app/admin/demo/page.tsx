'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FastForward,
  FileCheck,
  FileSearch,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatDateTime, formatRupees } from '@/lib/format';
import { useLabel } from '@/hooks/useLabel';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { AuditorIntegrityPanel } from '@/components/AuditorIntegrityPanel';
import { EvidenceForensicsViewer } from '@/components/EvidenceForensicsViewer';

export default function DemoConsolePage() {
  const {
    state,
    heroCampaign,
    totalRaised,
    totalHeld,
    totalReleased,
    totalRetained,
    actions,
  } = useAppState();

  const t = useLabel();
  const { settings, toggleMotion } = useAccessibility();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'forensics' | 'integrity'>('console');

  // Hero Campaign Stage 2 reference
  const heroStage2 = heroCampaign?.milestones.find((m) => m.id === 'ms-hero-2');
  const heroStage2Votes = heroStage2?.votes || [];
  const heroStage2Auditor1Voted = heroStage2Votes.some((v) => v.auditorId === 'auditor-1');

  // Trigger deciding vote as Auditor #A1
  const handleCastDecidingVote = () => {
    try {
      const res = actions.castVote(
        'camp-hero',
        'ms-hero-2',
        'auditor-1',
        'approve',
        {
          reviewSeconds: 52,
          openedAllEvidence: true,
          checklistAnswers: [
            { criterionId: 'crit-2-1', question: 'Pump model matches specs', satisfied: true },
            { criterionId: 'crit-2-2', question: 'State lab test IS 10500 potability', satisfied: true },
            { criterionId: 'crit-2-3', question: 'Geotag matches target school', satisfied: true },
          ],
          comments: 'Inspection completed. Pump specifications and water test certificates fully match project requirements.',
        }
      );
      if (res.outcome === 'approved') {
        setFeedback(
          `Deciding vote cast! Stage 2 reached 2-of-3 threshold. 80% (${formatRupees(res.immediatePayout || 64000)}) released immediately to NGO, and 20% (${formatRupees(res.retainedAmount || 16000)}) is held in the 48-hour challenge window.`
        );
      } else {
        setFeedback('Vote cast successfully.');
      }
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Error casting vote');
    }
  };

  // Trigger Fast-forward 48 hours
  const handleFastForward48h = () => {
    const res = actions.fastForwardTime(48);
    setFeedback(res.message);
  };

  // Trigger Fast-forward 65 days
  const handleFastForward65d = () => {
    const res = actions.fastForwardTime(24 * 65);
    setFeedback(`Fast-forwarded 65 days past the campaign deadline! ${res.message}`);
  };

  // Trigger Refund Claim test
  const handleClaimRefund = () => {
    try {
      const amount = actions.claimRefund('camp-hero', 'Vikramaditya S.');
      setFeedback(`Refund of ${formatRupees(amount)} claimed by donor Vikramaditya S. from remaining escrow balance!`);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Refund error');
    }
  };

  // Trigger Challenge Dispute test
  const handleFileDispute = () => {
    try {
      actions.fileDispute(
        'camp-hero',
        'ms-hero-2',
        'Concerned Donor (0x88c...43ae)',
        'Local community member reports water pipe connections are incomplete at the school boundary.',
        'Site photo submitted by community observer.'
      );
      setFeedback(
        'Dispute filed! Retained 20% is FROZEN, and a fresh 5-auditor re-review panel has been assigned.'
      );
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Dispute error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <section aria-labelledby="demo-console-heading" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 id="demo-console-heading" className="text-3xl font-bold">
              Demo &amp; Testing Console
            </h1>
            <p className="mt-1 text-muted">
              Interactive test bench to simulate milestone releases, blind auditor voting, anti-collusion canary traps, and forensic evidence inspection.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border-2 border-line bg-surface px-3 py-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Simulated Time: {formatDateTime(state.simulatedNow)}</span>
          </div>
        </div>

        {/* Global Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('console')}
              className={`btn text-xs sm:text-sm ${
                activeTab === 'console' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              <span>Escrow Simulation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forensics')}
              className={`btn text-xs sm:text-sm ${
                activeTab === 'forensics' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <FileSearch className="h-4 w-4" aria-hidden="true" />
              <span>Evidence Forensics</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('integrity')}
              className={`btn text-xs sm:text-sm ${
                activeTab === 'integrity' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>Auditor Integrity &amp; Canary</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                actions.loadSampleData();
                setFeedback('Sample data reloaded to baseline state.');
              }}
              className="btn btn-secondary text-xs sm:text-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Load Sample</span>
            </button>
            <button
              type="button"
              onClick={() => {
                actions.resetState();
                setFeedback('State reset completely.');
              }}
              className="btn btn-secondary text-xs sm:text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Feedback Notification */}
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
            className="text-xs underline font-bold"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* TAB 1: ESCROW SIMULATION CONSOLE */}
      {activeTab === 'console' && (
        <>
          {/* Live Hero Story Walkthrough Banner */}
          <section
            aria-labelledby="hero-story-heading"
            className="rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/5 via-surface to-primary/10 p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Interactive Live Pitch Demonstration
                </span>
                <h2 id="hero-story-heading" className="text-2xl font-bold">
                  Clean Water for Village Schools (Jal Seva Foundation)
                </h2>
                <p className="text-xs text-muted">
                  Stage 2: Installation of solar submersible pump (₹80,000 allocated · 2-of-3 blind auditor approvals required)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleFastForward48h}
                  className="btn btn-secondary text-xs"
                >
                  <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Fast-forward 48 Hours</span>
                </button>
                <button
                  type="button"
                  onClick={handleFastForward65d}
                  className="btn btn-secondary text-xs"
                >
                  <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Fast-forward 65 Days (Past Deadline)</span>
                </button>
              </div>
            </div>

            {/* Stage 2 Live Action Bench */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border-2 border-line bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Stage 2 Live Status:</span>
                  <span className="text-xs font-semibold capitalize rounded px-2 py-0.5 bg-warning/20 text-warning">
                    {heroStage2?.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  Stage 1 is completed. NGO uploaded solar pump photo, state potability lab certificate, and receipt.
                  Auditor #A2 has already reviewed and approved. Waiting for 1 more vote to reach threshold.
                </p>

                <div className="pt-2">
                  {!heroStage2Auditor1Voted && heroStage2?.status === 'under_review' ? (
                    <button
                      type="button"
                      onClick={handleCastDecidingVote}
                      className="btn btn-primary text-sm w-full"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span>Cast Deciding Vote (as Auditor #A1)</span>
                    </button>
                  ) : heroStage2?.status === 'approved_in_challenge' ? (
                    <div className="space-y-2 w-full">
                      <div className="rounded border border-warning bg-warning/10 p-2 text-xs text-warning">
                        Stage approved! ₹64,000 (80%) paid immediately. ₹16,000 (20%) held in 48h challenge window.
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleFastForward48h}
                          className="btn btn-primary text-xs flex-1"
                        >
                          <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Fast-Forward 48h (Release ₹16,000)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleFileDispute}
                          className="btn btn-secondary text-xs border-danger text-danger flex-1"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>File Dispute</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Stage completed and funds released in full.
                    </span>
                  )}
                </div>
              </div>

              {/* Anti-Collusion Safeguards */}
              <div className="rounded-lg border-2 border-line bg-surface p-4 space-y-2 text-sm">
                <h3 className="font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
                  <span>Anti-Collusion Layers Active</span>
                </h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span><strong>Pseudonymous Draw:</strong> NGO cannot identify auditors; panel members cannot view each other&apos;s identities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span><strong>Conflict Exclusion:</strong> Auditor #A3 has declared conflict with Gyan Jyoti Trust and is excluded automatically.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span><strong>Review Gate:</strong> Auditor cannot submit vote without inspecting all evidence and completing checklist.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span><strong>80/20 Retention:</strong> 20% held for 48 hours. Disputed stages trigger 5-auditor re-review and freeze held funds.</span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-line/50">
                  <button
                    type="button"
                    onClick={handleClaimRefund}
                    className="text-xs text-primary underline hover:opacity-80"
                  >
                    Test: Claim Pro-Rata Donor Refund (if stalled)
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Escrow Financial Balance Overview */}
          <section aria-labelledby="escrow-metrics-heading">
            <h2 id="escrow-metrics-heading" className="text-xl font-bold mb-3">
              Platform Escrow Balances
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="card space-y-1">
                <span className="text-xs font-semibold text-muted">Total Donated</span>
                <p className="text-2xl font-bold text-ink">{formatRupees(totalRaised)}</p>
                <span className="text-xs text-muted">Across all active causes</span>
              </div>

              <div className="card space-y-1 border-primary">
                <span className="text-xs font-semibold text-primary">In Protected Escrow</span>
                <p className="text-2xl font-bold text-primary">{formatRupees(totalHeld)}</p>
                <span className="text-xs text-muted">Held safely until proof check</span>
              </div>

              <div className="card space-y-1">
                <span className="text-xs font-semibold text-success">Paid Out to Charities</span>
                <p className="text-2xl font-bold text-success">{formatRupees(totalReleased)}</p>
                <span className="text-xs text-muted">Released post-audit &amp; challenge</span>
              </div>

              <div className="card space-y-1 border-warning">
                <span className="text-xs font-semibold text-warning">In 48h Retention</span>
                <p className="text-2xl font-bold text-warning">{formatRupees(totalRetained)}</p>
                <span className="text-xs text-muted">Subject to public challenge</span>
              </div>
            </div>
          </section>

          {/* Live Motion & Animation Preview Card (Verifies Reduced Motion) */}
          <section aria-labelledby="animation-preview-heading" className="card border-line">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 id="animation-preview-heading" className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span>Reduced Motion Verification &amp; Animation Test Bench</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Real-time preview to test the &ldquo;Stop animations&rdquo; switch. Judges and accessibility evaluators can visually verify that animations freeze immediately.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Current Mode:</span>
                {settings.motion === 'reduce' ? (
                  <span className="inline-flex items-center gap-1 rounded bg-danger/10 border border-danger px-2.5 py-1 text-xs font-bold text-danger">
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    PAUSED (Reduced Motion Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-success/10 border border-success px-2.5 py-1 text-xs font-bold text-success">
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    ANIMATING (Full Motion Active)
                  </span>
                )}
                <button
                  type="button"
                  onClick={toggleMotion}
                  className="btn btn-secondary text-xs py-1 px-2.5"
                >
                  {settings.motion === 'reduce' ? 'Enable Motion' : 'Stop Animations'}
                </button>
              </div>
            </div>

            {/* Animation Demonstration Elements */}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {/* Animated Escrow Flow */}
              <div className="rounded-lg border border-line bg-bg p-3 space-y-2">
                <span className="text-xs font-semibold text-muted">1. Escrow Stream Flow:</span>
                <div className="relative h-6 w-full overflow-hidden rounded bg-line/20">
                  <div
                    className={`h-full bg-gradient-to-r from-primary via-focus to-primary ${
                      settings.motion === 'reduce' ? '' : 'animate-pulse'
                    }`}
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  {settings.motion === 'reduce' ? 'Pulse animation frozen.' : 'Glow pulses continuously.'}
                </p>
              </div>

              {/* Progress Filling */}
              <div className="rounded-lg border border-line bg-bg p-3 space-y-2">
                <span className="text-xs font-semibold text-muted">2. Milestone Progress Bar:</span>
                <div className="h-6 w-full rounded bg-line/20 overflow-hidden">
                  <div
                    className={`h-full bg-success transition-all duration-700`}
                    style={{ width: '64%' }}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  Smooth CSS transitions disable automatically in reduced motion.
                </p>
              </div>

              {/* Rotating Status Ring */}
              <div className="rounded-lg border border-line bg-bg p-3 space-y-2">
                <span className="text-xs font-semibold text-muted">3. Escrow Oracle Spinner:</span>
                <div className="flex items-center gap-3">
                  <RefreshCw
                    className={`h-6 w-6 text-primary ${
                      settings.motion === 'reduce' ? '' : 'animate-spin'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold text-ink">
                    {settings.motion === 'reduce' ? 'Spinner static' : 'Rotating at 60fps'}
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  Rotation halts when reduced motion is requested.
                </p>
              </div>
            </div>
          </section>

          {/* Live Audit Ledger */}
          <section aria-labelledby="audit-ledger-heading" className="card">
            <h2 id="audit-ledger-heading" className="text-xl font-bold mb-3">
              Public Audit Ledger (Recent Events)
            </h2>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {state.auditEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-3 rounded border border-line/50 bg-surface p-2.5 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary uppercase text-[10px] rounded bg-primary/10 px-1.5 py-0.5">
                        {event.type}
                      </span>
                      <span className="font-semibold text-ink">{event.actorName}</span>
                      <span className="text-muted">({formatDateTime(event.timestamp)})</span>
                    </div>
                    <p className="text-ink/80">{event.details}</p>
                  </div>
                  <span className="font-mono text-[10px] text-muted shrink-0">
                    {event.txHash.slice(0, 10)}...{event.txHash.slice(-6)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* TAB 2: EVIDENCE FORENSICS WORKBENCH */}
      {activeTab === 'forensics' && (
        <section aria-labelledby="forensics-heading" className="space-y-4">
          <div className="rounded-xl border-2 border-line bg-surface p-4">
            <h2 id="forensics-heading" className="text-xl font-bold">
              Evidence Forensics Workbench
            </h2>
            <p className="text-xs text-muted mt-1">
              Automated multi-layered forensic inspection: perceptual duplicate check, EXIF geotag matching, C2PA content credentials, advisory AI generation score, and invoice budget reconciliation.
            </p>
          </div>

          <EvidenceForensicsViewer
            evidence={heroStage2?.evidence || []}
            milestone={heroStage2}
          />
        </section>
      )}

      {/* TAB 3: AUDITOR INTEGRITY & ANTI-COLLUSION */}
      {activeTab === 'integrity' && (
        <section aria-labelledby="integrity-heading">
          <AuditorIntegrityPanel />
        </section>
      )}
    </div>
  );
}
