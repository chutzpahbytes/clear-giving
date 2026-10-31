import type {
  AppState,
  AuditEvent,
  ChecklistAnswer,
  Dispute,
  Donation,
  EvidenceItem,
  EvidenceMetadata,
  Milestone,
} from '@/types/models';
import {
  calculateRetentionSplit,
  drawAuditorPanel,
  evaluateVotesOutcome,
  CHALLENGE_WINDOW_HOURS,
  checkRefundEligibility,
} from '@/lib/rules';
import { generateSimulatedCid, generateTxHash } from '@/lib/ipfs';
import { getInitialAppState } from '@/lib/sampleData';
import type { IPlatformService } from './types';

const STORAGE_KEY = 'clear_giving_state_v2';

export class SimulatorService implements IPlatformService {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage() || getInitialAppState();
  }

  private loadFromStorage(): AppState | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as AppState;
      }
    } catch {
      // Ignore storage errors
    }
    return null;
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage errors
    }
    this.notify();
  }

  private notify(): void {
    const clone = this.getState();
    this.listeners.forEach((fn) => fn(clone));
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public loadSampleData(): AppState {
    this.state = getInitialAppState();
    this.saveToStorage();
    return this.getState();
  }

  public resetState(): AppState {
    return this.loadSampleData();
  }

  public donate(
    campaignId: string,
    amount: number,
    donorName: string,
    donorAddress = '0x' + Math.random().toString(16).slice(2, 10)
  ): { state: AppState; donation: Donation } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.raisedAmount += amount;
    campaign.heldAmount += amount;

    const txHash = generateTxHash();
    const donation: Donation = {
      id: `don-${Date.now()}`,
      campaignId,
      donorAddress,
      donorName,
      amount,
      createdAt: this.state.simulatedNow,
      refundClaimed: false,
      txHash,
    };

    this.state.donations.unshift(donation);

    const auditEvent: AuditEvent = {
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'DONATION',
      actorRole: 'donor',
      actorId: donorAddress,
      actorName: donorName,
      campaignId,
      details: `Donation of ₹${amount.toLocaleString('en-IN')} deposited into smart-contract escrow.`,
      txHash,
    };

    this.state.auditEvents.unshift(auditEvent);
    this.saveToStorage();
    return { state: this.getState(), donation };
  }

  public submitProof(
    campaignId: string,
    milestoneId: string,
    proof: {
      title: string;
      description: string;
      fileUrl: string;
      fileType: 'image' | 'pdf' | 'receipt';
      claimedAmount?: number;
      metadata?: EvidenceMetadata;
      isCanary?: boolean;
    }
  ): { state: AppState } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const milestone = campaign.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const cid = generateSimulatedCid(proof.title + proof.description);
    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: proof.title,
      description: proof.description,
      fileUrl: proof.fileUrl,
      fileHash: cid,
      fileType: proof.fileType,
      uploadedAt: this.state.simulatedNow,
      claimedAmount: proof.claimedAmount || milestone.targetAmount,
      metadata: proof.metadata || {},
      isCanary: proof.isCanary,
    };

    milestone.evidence.push(newEvidence);
    milestone.status = 'under_review';

    // If auditors not yet assigned, draw panel
    if (!milestone.assignedAuditors || milestone.assignedAuditors.length === 0) {
      const drawn = drawAuditorPanel(
        this.state.auditors,
        campaign.ngoId,
        campaign.id,
        milestone.panelSize
      );
      milestone.assignedAuditors = drawn.map((a) => a.id);
    }

    const txHash = generateTxHash();
    const auditEvent: AuditEvent = {
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'PROOF_SUBMITTED',
      actorRole: 'ngo',
      actorId: campaign.ngoId,
      actorName: this.state.ngos.find((n) => n.id === campaign.ngoId)?.name || 'Charity',
      campaignId,
      milestoneId,
      details: `Proof submitted for ${milestone.title}: "${proof.title}" (IPFS CID: ${cid})`,
      txHash,
    };

    this.state.auditEvents.unshift(auditEvent);
    this.saveToStorage();
    return { state: this.getState() };
  }

  public castVote(
    campaignId: string,
    milestoneId: string,
    auditorId: string,
    decision: 'approve' | 'reject',
    reviewData: {
      reviewSeconds: number;
      openedAllEvidence: boolean;
      checklistAnswers: ChecklistAnswer[];
      comments?: string;
    }
  ): {
    state: AppState;
    outcome: 'approved' | 'rejected' | 'pending';
    immediatePayout?: number;
    retainedAmount?: number;
  } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const milestone = campaign.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const auditor = this.state.auditors.find((a) => a.id === auditorId);
    if (!auditor) throw new Error('Auditor not found');

    // Prevent double voting
    if (milestone.votes.some((v) => v.auditorId === auditorId)) {
      throw new Error('Auditor has already cast a vote for this stage.');
    }

    const vote = {
      id: `vote-${Date.now()}`,
      milestoneId,
      auditorId,
      decision,
      comments: reviewData.comments,
      reviewSeconds: reviewData.reviewSeconds,
      openedAllEvidence: reviewData.openedAllEvidence,
      checklistAnswers: reviewData.checklistAnswers,
      createdAt: this.state.simulatedNow,
    };

    milestone.votes.push(vote);

    const voteTx = generateTxHash();
    this.state.auditEvents.unshift({
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'VOTE_CAST',
      actorRole: 'auditor',
      actorId: auditor.id,
      actorName: auditor.pseudonym,
      campaignId,
      milestoneId,
      details: `Blind vote cast: ${decision.toUpperCase()} by ${auditor.pseudonym}.`,
      txHash: voteTx,
    });

    // Canary Detection check: if an auditor approves a secret canary fake proof, flag and suspend immediately
    const hasCanary = milestone.evidence.some((e) => e.isCanary);
    if (hasCanary && decision === 'approve') {
      auditor.isCanaryFlagged = true;
      auditor.status = 'suspended';
      this.state.auditEvents.unshift({
        id: `ae-${Date.now()}-canary`,
        timestamp: this.state.simulatedNow,
        type: 'CANARY_INJECTED',
        actorRole: 'system',
        actorId: 'canary-trap',
        actorName: 'Anti-Collusion Oracle',
        campaignId,
        milestoneId,
        details: `CANARY TRAP TRIGGERED: ${auditor.pseudonym} voted APPROVE on a known synthetic canary proof without scrutiny! Auditor flagged and suspended immediately.`,
        txHash: generateTxHash(),
      });
    }

    // Evaluate milestone votes
    const { outcome, approveCount } = evaluateVotesOutcome(milestone);
    let immediatePayout = 0;
    let retainedAmount = 0;

    if (outcome === 'approved') {
      milestone.status = 'approved_in_challenge';

      // 80/20 Retention rule
      const split = calculateRetentionSplit(milestone.targetAmount);
      immediatePayout = split.immediatePayout;
      retainedAmount = split.retainedAmount;

      milestone.retainedAmount = retainedAmount;
      const challengeEnd = new Date(
        new Date(this.state.simulatedNow).getTime() +
          CHALLENGE_WINDOW_HOURS * 3600 * 1000
      ).toISOString();
      milestone.challengeEndsAt = challengeEnd;

      // Update campaign finances
      campaign.heldAmount -= milestone.targetAmount;
      campaign.releasedAmount += immediatePayout;
      campaign.retainedAmount += retainedAmount;

      const approveTx = generateTxHash();
      this.state.auditEvents.unshift({
        id: `ae-${Date.now()}-1`,
        timestamp: this.state.simulatedNow,
        type: 'STAGE_APPROVED',
        actorRole: 'system',
        actorId: 'escrow-engine',
        actorName: 'Escrow Engine',
        campaignId,
        milestoneId,
        details: `Stage approved with ${approveCount} approvals. 80% (₹${immediatePayout.toLocaleString('en-IN')}) released immediately to NGO.`,
        txHash: approveTx,
      });

      this.state.auditEvents.unshift({
        id: `ae-${Date.now()}-2`,
        timestamp: this.state.simulatedNow,
        type: 'RETENTION_HELD',
        actorRole: 'system',
        actorId: 'escrow-engine',
        actorName: 'Escrow Engine',
        campaignId,
        milestoneId,
        details: `20% (₹${retainedAmount.toLocaleString('en-IN')}) held in 48-hour challenge window (ends ${new Date(challengeEnd).toLocaleString('en-IN')}).`,
        txHash: generateTxHash(),
      });

      // Update NGO Trust Passport score (+1 point on approval)
      const ngo = this.state.ngos.find((n) => n.id === campaign.ngoId);
      if (ngo) {
        ngo.trustPassport.score = Math.min(100, ngo.trustPassport.score + 1);
      }
    } else if (outcome === 'rejected') {
      milestone.status = 'rejected';
      this.state.auditEvents.unshift({
        id: `ae-${Date.now()}`,
        timestamp: this.state.simulatedNow,
        type: 'STAGE_APPROVED', // Marked outcome
        actorRole: 'system',
        actorId: 'escrow-engine',
        actorName: 'Escrow Engine',
        campaignId,
        milestoneId,
        details: `Stage rejected by majority auditor decision. Evidence returned to NGO for rectification.`,
        txHash: generateTxHash(),
      });
      const ngo = this.state.ngos.find((n) => n.id === campaign.ngoId);
      if (ngo) {
        ngo.trustPassport.rejectedProofsCount += 1;
        ngo.trustPassport.score = Math.max(0, ngo.trustPassport.score - 3);
      }
    }

    this.saveToStorage();
    return {
      state: this.getState(),
      outcome,
      immediatePayout: immediatePayout || undefined,
      retainedAmount: retainedAmount || undefined,
    };
  }

  public fileDispute(
    campaignId: string,
    milestoneId: string,
    filedBy: string,
    reason: string,
    evidence: string
  ): { state: AppState; dispute: Dispute } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const milestone = campaign.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    if (milestone.status !== 'approved_in_challenge') {
      throw new Error('Disputes can only be filed during the 48-hour challenge window.');
    }

    // Freeze retained amount and assign fresh 5-auditor re-review panel
    const reReviewPanel = drawAuditorPanel(
      this.state.auditors,
      campaign.ngoId,
      campaign.id,
      5,
      milestone.assignedAuditors
    ).map((a) => a.id);

    const dispute: Dispute = {
      id: `disp-${Date.now()}`,
      milestoneId,
      campaignId,
      filedBy,
      reason,
      evidence,
      status: 'pending',
      createdAt: this.state.simulatedNow,
      reReviewPanel,
    };

    milestone.disputes.push(dispute);
    milestone.status = 'disputed';

    const txHash = generateTxHash();
    this.state.auditEvents.unshift({
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'DISPUTE_FILED',
      actorRole: 'donor',
      actorId: filedBy,
      actorName: filedBy,
      campaignId,
      milestoneId,
      details: `Dispute filed by ${filedBy}: "${reason}". Retained funds frozen; 5-auditor re-review panel assigned.`,
      txHash,
    });

    this.saveToStorage();
    return { state: this.getState(), dispute };
  }

  public resolveDispute(
    disputeId: string,
    upheld: boolean,
    notes = ''
  ): { state: AppState } {
    for (const campaign of this.state.campaigns) {
      for (const milestone of campaign.milestones) {
        const dispute = milestone.disputes.find((d) => d.id === disputeId);
        if (dispute) {
          dispute.status = upheld ? 'upheld' : 'dismissed';
          dispute.resolutionNotes = notes;

          if (upheld) {
            // Overturn approval, penalize NGO and approving auditors
            milestone.status = 'flagged';
            campaign.status = 'paused';
            const ngo = this.state.ngos.find((n) => n.id === campaign.ngoId);
            if (ngo) {
              ngo.trustPassport.score = Math.max(10, ngo.trustPassport.score - 25);
            }
            // Flag approving auditors
            const approvingAuditorIds = milestone.votes
              .filter((v) => v.decision === 'approve')
              .map((v) => v.auditorId);
            this.state.auditors.forEach((aud) => {
              if (approvingAuditorIds.includes(aud.id)) {
                aud.isCanaryFlagged = true;
              }
            });
          } else {
            // Dismissed: proceed to release
            milestone.status = 'released';
            campaign.releasedAmount += milestone.retainedAmount;
            campaign.retainedAmount -= milestone.retainedAmount;
            milestone.retainedAmount = 0;
            milestone.releasedAt = this.state.simulatedNow;
          }

          this.state.auditEvents.unshift({
            id: `ae-${Date.now()}`,
            timestamp: this.state.simulatedNow,
            type: 'DISPUTE_RESOLVED',
            actorRole: 'admin',
            actorId: 'admin',
            actorName: 'Admin Panel',
            campaignId: campaign.id,
            milestoneId: milestone.id,
            details: `Dispute ${disputeId} resolved as ${upheld ? 'UPHELD (Approval Overturned)' : 'DISMISSED'}. ${notes}`,
            txHash: generateTxHash(),
          });

          this.saveToStorage();
          return { state: this.getState() };
        }
      }
    }
    throw new Error('Dispute not found');
  }

  public fastForwardTime(hours: number): {
    state: AppState;
    message: string;
    releasedRetentions: number;
  } {
    const currentMs = new Date(this.state.simulatedNow).getTime();
    const newMs = currentMs + hours * 3600 * 1000;
    this.state.simulatedNow = new Date(newMs).toISOString();

    let releasedCount = 0;
    let releasedRupees = 0;

    // Check challenge window expiries
    for (const campaign of this.state.campaigns) {
      for (let i = 0; i < campaign.milestones.length; i++) {
        const milestone = campaign.milestones[i];

        if (
          milestone.status === 'approved_in_challenge' &&
          milestone.challengeEndsAt
        ) {
          const endMs = new Date(milestone.challengeEndsAt).getTime();
          const hasPendingDispute = milestone.disputes.some(
            (d) => d.status === 'pending'
          );

          if (newMs >= endMs && !hasPendingDispute) {
            // Release the held 20%
            const retained = milestone.retainedAmount;
            milestone.status = 'released';
            milestone.releasedAt = this.state.simulatedNow;
            campaign.releasedAmount += retained;
            campaign.retainedAmount -= retained;
            milestone.retainedAmount = 0;

            releasedCount++;
            releasedRupees += retained;

            this.state.auditEvents.unshift({
              id: `ae-${Date.now()}-${releasedCount}`,
              timestamp: this.state.simulatedNow,
              type: 'FUNDS_RELEASED',
              actorRole: 'system',
              actorId: 'escrow-engine',
              actorName: 'Escrow Engine',
              campaignId: campaign.id,
              milestoneId: milestone.id,
              details: `48-hour challenge window ended with zero disputes. Retained ₹${retained.toLocaleString('en-IN')} released to NGO.`,
              txHash: generateTxHash(),
            });

            // Unlock next milestone if available
            const nextMilestone = campaign.milestones[i + 1];
            if (nextMilestone && nextMilestone.status === 'locked') {
              nextMilestone.status = 'awaiting_proof';
            }
          }
        }
      }

      // Check if all milestones are released -> mark completed
      const allReleased = campaign.milestones.every((m) => m.status === 'released');
      if (allReleased && campaign.status === 'active') {
        campaign.status = 'completed';
      }

      // Check deadline
      const deadlineMs = new Date(campaign.deadline).getTime();
      if (newMs > deadlineMs && campaign.status === 'active' && !allReleased) {
        campaign.status = 'stalled';
      }
    }

    const timeTx = generateTxHash();
    const message = `Fast-forwarded simulated time by ${hours} hours to ${new Date(newMs).toLocaleString('en-IN')}.${releasedCount > 0 ? ` Released ₹${releasedRupees.toLocaleString('en-IN')} across ${releasedCount} challenge retention(s).` : ''}`;

    this.state.auditEvents.unshift({
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'TIME_WARPED',
      actorRole: 'system',
      actorId: 'demo-console',
      actorName: 'Demo Console',
      details: message,
      txHash: timeTx,
    });

    this.saveToStorage();
    return {
      state: this.getState(),
      message,
      releasedRetentions: releasedRupees,
    };
  }

  public claimRefund(
    campaignId: string,
    donorAddressOrName: string
  ): { state: AppState; refundAmount: number } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const eligibility = checkRefundEligibility(campaign, this.state.simulatedNow);
    if (!eligibility.eligible) {
      throw new Error(`Refund not available: ${eligibility.reason}`);
    }

    // Find donor donations
    const donorDonations = this.state.donations.filter(
      (d) =>
        d.campaignId === campaignId &&
        (d.donorAddress === donorAddressOrName || d.donorName === donorAddressOrName) &&
        !d.refundClaimed
    );

    if (donorDonations.length === 0) {
      throw new Error('No unspent donations found for this donor.');
    }

    const totalGiven = donorDonations.reduce((sum, d) => sum + d.amount, 0);
    // Pro-rata refund based on remaining held balance
    const proRataRatio = campaign.raisedAmount > 0 ? campaign.heldAmount / campaign.raisedAmount : 0;
    const refundAmount = Math.round(totalGiven * proRataRatio);

    donorDonations.forEach((d) => (d.refundClaimed = true));
    campaign.heldAmount = Math.max(0, campaign.heldAmount - refundAmount);

    const txHash = generateTxHash();
    this.state.auditEvents.unshift({
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'REFUND_CLAIMED',
      actorRole: 'donor',
      actorId: donorAddressOrName,
      actorName: donorAddressOrName,
      campaignId,
      details: `Pro-rata refund of ₹${refundAmount.toLocaleString('en-IN')} claimed due to missed campaign milestone deadline.`,
      txHash,
    });

    this.saveToStorage();
    return { state: this.getState(), refundAmount };
  }

  public approvePlan(campaignId: string, auditorId: string): { state: AppState } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (!campaign.planApprovedBy.includes(auditorId)) {
      campaign.planApprovedBy.push(auditorId);
    }

    if (campaign.planApprovedBy.length >= 2) {
      campaign.planApproved = true;
      if (campaign.status === 'plan_review') {
        campaign.status = 'active';
      }
    }

    this.state.auditEvents.unshift({
      id: `ae-${Date.now()}`,
      timestamp: this.state.simulatedNow,
      type: 'PLAN_APPROVED',
      actorRole: 'auditor',
      actorId: auditorId,
      actorName: this.state.auditors.find((a) => a.id === auditorId)?.pseudonym || auditorId,
      campaignId,
      details: `Campaign milestone plan reviewed and approved by auditor panel.`,
      txHash: generateTxHash(),
    });

    this.saveToStorage();
    return { state: this.getState() };
  }

  public injectCanaryProof(
    campaignId: string,
    milestoneId: string,
    canaryTitle = 'Secret Integrity Canary: Altered Submersible Pump Specs'
  ): { state: AppState; canaryEvidence: EvidenceItem } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const milestone = campaign.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const canaryId = `ev-canary-${Date.now()}`;
    const canaryEvidence: EvidenceItem = {
      id: canaryId,
      title: canaryTitle,
      description:
        'Platform integrity canary proof. Injected secretly with high AI diffusion artifacts, Mumbai geotag (900km mismatch), and an altered ₹95,000 invoice (exceeds ₹80,000 budget). Vigilance test for rubber-stamping auditors.',
      fileUrl: '/sample-proofs/canary-pump-altered.jpg',
      fileHash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      fileType: 'image',
      uploadedAt: this.state.simulatedNow,
      claimedAmount: 95000,
      isCanary: true,
      metadata: {
        date: '2023-01-15',
        location: 'Synthetic Diffusion Canvas (Mumbai studio)',
        gpsCoords: { lat: 19.076, lng: 72.8777 },
        camera: 'Midjourney v6.0 Synthetic Gen',
        c2pa: false,
        isAIAdvisoryScore: 89,
        isReused: true,
      },
    };

    milestone.evidence.push(canaryEvidence);
    if (milestone.status === 'awaiting_proof') {
      milestone.status = 'under_review';
    }

    const txHash = generateTxHash();
    this.state.auditEvents.unshift({
      id: `ae-${Date.now()}-canary-inj`,
      timestamp: this.state.simulatedNow,
      type: 'CANARY_INJECTED',
      actorRole: 'admin',
      actorId: 'admin-platform',
      actorName: 'Platform Integrity Admin',
      campaignId,
      milestoneId,
      details: `Secret Canary Proof injected into "${milestone.title}". Auditors cannot identify it from legitimate submissions. Automatic rubber-stamp detection armed.`,
      txHash,
    });

    this.saveToStorage();
    return { state: this.getState(), canaryEvidence };
  }
}

export const simulatorService = new SimulatorService();
