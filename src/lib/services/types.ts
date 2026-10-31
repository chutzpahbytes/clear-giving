import type {
  AppState,
  ChecklistAnswer,
  Dispute,
  Donation,
  EvidenceItem,
  EvidenceMetadata,
} from '@/types/models';

export interface IPlatformService {
  getState(): AppState;
  loadSampleData(): AppState;
  resetState(): AppState;

  donate(
    campaignId: string,
    amount: number,
    donorName: string,
    donorAddress?: string
  ): { state: AppState; donation: Donation };

  submitProof(
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
  ): { state: AppState };

  castVote(
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
  };

  fileDispute(
    campaignId: string,
    milestoneId: string,
    filedBy: string,
    reason: string,
    evidence: string
  ): { state: AppState; dispute: Dispute };

  resolveDispute(
    disputeId: string,
    upheld: boolean,
    notes?: string
  ): { state: AppState };

  fastForwardTime(hours: number): {
    state: AppState;
    message: string;
    releasedRetentions: number;
  };

  claimRefund(
    campaignId: string,
    donorAddressOrName: string
  ): { state: AppState; refundAmount: number };

  approvePlan(campaignId: string, auditorId: string): { state: AppState };

  injectCanaryProof(
    campaignId: string,
    milestoneId: string,
    canaryTitle?: string
  ): { state: AppState; canaryEvidence: EvidenceItem };

  subscribe(listener: (state: AppState) => void): () => void;
}
