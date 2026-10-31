'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSearch,
  Heart,
  HelpCircle,
  Layers,
  MapPin,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatDateTime, formatRupees } from '@/lib/format';
import { useLabel } from '@/hooks/useLabel';
import { EvidenceForensicsViewer } from '@/components/EvidenceForensicsViewer';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = (params?.id as string) || 'camp-hero';
  const { state, actions } = useAppState();
  const t = useLabel();

  const campaign = state.campaigns.find((c) => c.id === campaignId) || state.campaigns[0];
  const ngo = state.ngos.find((n) => n.id === campaign?.ngoId);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    campaign?.milestones[1]?.id || campaign?.milestones[0]?.id || ''
  );
  const [notification, setNotification] = useState<string | null>(null);

  if (!campaign) {
    return (
      <div className="card text-center p-8">
        <h1 className="text-xl font-bold">Campaign Not Found</h1>
        <Link href="/campaigns" className="btn btn-primary mt-4 inline-flex">
          Back to Browse Causes
        </Link>
      </div>
    );
  }

  const selectedMilestone =
    campaign.milestones.find((m) => m.id === selectedMilestoneId) || campaign.milestones[0];
  const percentFunded = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));

  // Fast forward 48h for retention release
  const handleFastForward48h = () => {
    const res = actions.fastForwardTime(48);
    setNotification(res.message);
  };

  // Claim pro-rata refund
  const handleRefund = () => {
    try {
      const amt = actions.claimRefund(campaign.id, 'Vikramaditya S.');
      setNotification(`Refund of ${formatRupees(amt)} successfully processed from unspent escrow!`);
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : 'Refund error');
    }
  };

  // File public dispute
  const handleDispute = () => {
    try {
      actions.fileDispute(
        campaign.id,
        selectedMilestone.id,
        'Concerned Observer (0x77b...12ac)',
        'Water pump depth test shows potential discrepancy with borewell specifications.',
        'Independent lab report attached.'
      );
      setNotification(
        'Dispute filed! 20% retained funds are frozen and a 5-auditor re-review panel has been convened.'
      );
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : 'Dispute error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to All Verified Causes</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
            {campaign.category}
          </span>
          <span className="rounded border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
            Status: {campaign.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {notification && (
        <aside
          role="status"
          aria-live="polite"
          className="flex items-start justify-between gap-4 rounded-xl border-2 border-primary bg-primary/10 p-4 font-semibold text-ink"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <p className="text-sm">{notification}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Main Campaign Hero Header */}
      <section className="rounded-xl border-2 border-line bg-surface p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">{campaign.title}</h1>
            <p className="mt-1 text-sm text-muted">
              Organized by <strong>{ngo?.name}</strong> • Registered NGO ({ngo?.registrationNumber}) • {ngo?.location}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted block">Escrow Contract Balance:</span>
            <span className="text-2xl font-bold text-primary">{formatRupees(campaign.heldAmount)}</span>
            <span className="text-xs text-muted block">Held safely in multi-sig vault</span>
          </div>
        </div>

        <p className="text-sm text-ink/90 leading-relaxed max-w-4xl">{campaign.description}</p>

        {/* Progress and Financial Metrics */}
        <div className="grid gap-4 sm:grid-cols-4 pt-4 border-t border-line/40">
          <div className="rounded-lg border border-line/60 bg-bg p-3">
            <span className="text-xs text-muted block">Goal Amount:</span>
            <p className="text-lg font-bold text-ink">{formatRupees(campaign.goalAmount)}</p>
          </div>
          <div className="rounded-lg border border-line/60 bg-bg p-3">
            <span className="text-xs text-muted block">Raised So Far:</span>
            <p className="text-lg font-bold text-ink">{formatRupees(campaign.raisedAmount)} ({percentFunded}%)</p>
          </div>
          <div className="rounded-lg border border-line/60 bg-bg p-3">
            <span className="text-xs text-muted block">Released Post-Audit:</span>
            <p className="text-lg font-bold text-success">{formatRupees(campaign.releasedAmount)}</p>
          </div>
          <div className="rounded-lg border border-line/60 bg-bg p-3">
            <span className="text-xs text-muted block">In 48h Challenge Retention:</span>
            <p className="text-lg font-bold text-warning">{formatRupees(campaign.retainedAmount)}</p>
          </div>
        </div>
      </section>

      {/* NGO Trust Passport Deep Dive */}
      {ngo && (
        <section aria-labelledby="trust-passport-heading" className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
              <div>
                <h2 id="trust-passport-heading" className="text-lg font-bold">
                  Verified NGO Trust Passport: {ngo.name}
                </h2>
                <p className="text-xs text-muted">
                  Cryptographically verified track record. Calculated from actual historical escrow milestone completions.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-primary bg-surface px-4 py-2 text-center">
              <span className="text-xs text-muted block font-semibold">Trust Score</span>
              <span className="text-2xl font-bold text-primary">{ngo.trustPassport.score}/100</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-lg border border-line/60 bg-surface p-3">
              <span className="text-muted block">Completed Campaigns:</span>
              <p className="text-base font-bold text-ink mt-0.5">{ngo.trustPassport.completedCampaigns} Projects</p>
            </div>
            <div className="rounded-lg border border-line/60 bg-surface p-3">
              <span className="text-muted block">On-Time Milestone Rate:</span>
              <p className="text-base font-bold text-success mt-0.5">{ngo.trustPassport.onTimeRate}% on-time</p>
            </div>
            <div className="rounded-lg border border-line/60 bg-surface p-3">
              <span className="text-muted block">Rejected Proofs Count:</span>
              <p className="text-base font-bold text-ink mt-0.5">{ngo.trustPassport.rejectedProofsCount} (Remediated)</p>
            </div>
            <div className="rounded-lg border border-line/60 bg-surface p-3">
              <span className="text-muted block">Avg Auditor Review Time:</span>
              <p className="text-base font-bold text-ink mt-0.5">{ngo.trustPassport.avgAuditTimeHours} Hours</p>
            </div>
          </div>
        </section>
      )}

      {/* Milestone Stages Timeline */}
      <section aria-labelledby="milestones-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="milestones-heading" className="text-xl font-bold">
              Milestone Escrow Stages ({campaign.milestones.length} Sequential Milestones)
            </h2>
            <p className="text-xs text-muted">
              Stages execute in strict sequence. Each stage requires independent auditor verification + 48-hour challenge retention.
            </p>
          </div>

          {/* Stalled Campaign Refund Trigger */}
          <button
            type="button"
            onClick={handleRefund}
            className="btn btn-secondary text-xs border-line hover:border-primary"
            title="If an NGO stalls or fails to complete work past deadline, donors can claim unspent funds back"
          >
            <RotateCcw className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Test Stalled Refund Claim</span>
          </button>
        </div>

        {/* Milestone Stage Buttons */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {campaign.milestones.map((ms) => {
            const isSelected = ms.id === selectedMilestone.id;
            const isReleased = ms.status === 'released';
            const isChallenge = ms.status === 'approved_in_challenge';
            const isUnderReview = ms.status === 'under_review';

            return (
              <button
                key={ms.id}
                type="button"
                onClick={() => setSelectedMilestoneId(ms.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-line bg-surface hover:border-line/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-muted">Stage {ms.order}</span>
                  {isReleased && (
                    <span className="inline-flex items-center gap-1 rounded bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      RELEASED
                    </span>
                  )}
                  {isChallenge && (
                    <span className="inline-flex items-center gap-1 rounded bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      48H RETENTION
                    </span>
                  )}
                  {isUnderReview && (
                    <span className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                      AUDITING
                    </span>
                  )}
                  {ms.status === 'awaiting_proof' && (
                    <span className="text-[10px] font-semibold text-muted">AWAITING PROOF</span>
                  )}
                </div>

                <h3 className="mt-2 text-sm font-bold text-ink leading-snug">{ms.title}</h3>
                <p className="mt-1 text-xs font-semibold text-primary">{formatRupees(ms.targetAmount)}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Milestone Deep-Dive Box */}
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/40 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Stage {selectedMilestone.order} Detailed Inspection
              </span>
              <h3 className="text-xl font-bold mt-1">{selectedMilestone.title}</h3>
              <p className="text-xs text-muted mt-0.5">{selectedMilestone.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-line bg-bg px-3 py-1 font-semibold text-muted">
                Panel: {selectedMilestone.panelSize} Auditors ({selectedMilestone.requiredApprovals} Approvals Required)
              </span>
              <span className="rounded-lg border border-line bg-bg px-3 py-1 font-semibold text-muted">
                Status: <strong className="text-ink capitalize">{selectedMilestone.status.replace(/_/g, ' ')}</strong>
              </span>
            </div>
          </div>

          {/* Retention & Challenge Window Controls */}
          {selectedMilestone.status === 'approved_in_challenge' && (
            <div className="rounded-lg border-2 border-warning bg-warning/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
                  <span className="font-bold text-sm text-warning">
                    48-Hour Challenge Window Active
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-warning">
                  Held: {formatRupees(selectedMilestone.retainedAmount)} (20%)
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                80% was released immediately to the charity. 20% is held back to protect donors against hidden defects.
                Any donor or community member can inspect evidence and dispute before retention release.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleFastForward48h}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  Fast-Forward 48h (Release 20% Retention)
                </button>
                <button
                  type="button"
                  onClick={handleDispute}
                  className="btn btn-secondary text-xs py-1.5 px-3 border-danger text-danger"
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>File Public Challenge / Dispute</span>
                </button>
              </div>
            </div>
          )}

          {/* Planned vs Reported Impact (Founder PS Differentiator) */}
          <div className="rounded-lg border border-line/60 bg-bg p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Planned vs Reported Real-World Impact
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded border border-line/40 bg-surface p-2.5">
                <span className="text-muted block">Planned Stage Target:</span>
                <p className="font-semibold text-ink mt-0.5">
                  Install 3.5HP solar pump system delivering 12,000L clean drinking water per day to 450 school children.
                </p>
              </div>
              <div className="rounded border border-line/40 bg-surface p-2.5">
                <span className="text-muted block">Reported Execution (Verified):</span>
                <p className="font-semibold text-ink mt-0.5">
                  Borewell depth 220ft, certified solar pump operational, water potability test cleared (IS 10500 standard).
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Forensics Workbench attached to this stage */}
          <div>
            <h4 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Attached Evidence &amp; Forensic Workbench</span>
            </h4>
            <EvidenceForensicsViewer
              evidence={selectedMilestone.evidence}
              milestone={selectedMilestone}
            />
          </div>
        </div>
      </section>

      {/* Role Powers Callout at bottom */}
      <RolePowersCard roleOverride="donor" />
    </div>
  );
}
