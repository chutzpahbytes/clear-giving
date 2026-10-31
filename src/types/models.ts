export type MilestoneStatus =
  | 'locked'
  | 'awaiting_proof'
  | 'under_review'
  | 'approved_in_challenge'
  | 'released'
  | 'rejected'
  | 'flagged'
  | 'disputed';

export interface EvidenceMetadata {
  date?: string;
  location?: string;
  gpsCoords?: { lat: number; lng: number };
  camera?: string;
  c2pa?: boolean;
  isAIAdvisoryScore?: number; // 0-100 advisory score
  isReused?: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileHash: string; // Simulated IPFS CID
  fileType: 'image' | 'pdf' | 'receipt';
  uploadedAt: string;
  claimedAmount?: number;
  metadata?: EvidenceMetadata;
  isCanary?: boolean; // Hidden from regular auditors
}

export interface ChecklistCriterion {
  id: string;
  question: string;
  required: boolean;
}

export interface ChecklistAnswer {
  criterionId: string;
  question: string;
  satisfied: boolean;
}

export interface Vote {
  id: string;
  milestoneId: string;
  auditorId: string;
  decision: 'approve' | 'reject';
  comments?: string;
  reviewSeconds: number;
  openedAllEvidence: boolean;
  checklistAnswers: ChecklistAnswer[];
  createdAt: string;
}

export interface Dispute {
  id: string;
  milestoneId: string;
  campaignId: string;
  filedBy: string; // donor or auditor address/name
  reason: string;
  evidence: string;
  status: 'pending' | 'upheld' | 'dismissed';
  createdAt: string;
  reReviewPanel: string[]; // 5 auditors assigned for re-review
  resolutionNotes?: string;
}

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  order: number;
  targetAmount: number; // rupee amount allocated to this stage
  releasePercent: number; // percentage of target
  status: MilestoneStatus;
  panelSize: 3 | 5; // 3 if payout < 1,00,000, 5 if >= 1,00,000
  requiredApprovals: 2 | 3; // 2-of-3 or 3-of-5
  assignedAuditors: string[]; // auditor IDs assigned
  evidence: EvidenceItem[];
  checklistCriteria: ChecklistCriterion[];
  votes: Vote[];
  retainedAmount: number; // 20% held during 48-hour challenge window
  challengeEndsAt?: string; // ISO timestamp
  disputes: Dispute[];
  releasedAt?: string;
}

export interface TrustPassport {
  completedCampaigns: number;
  onTimeRate: number; // percentage (e.g. 100%)
  rejectedProofsCount: number;
  avgAuditTimeHours: number;
  score: number; // 0 - 100 overall trust score
}

export interface NGO {
  id: string;
  name: string;
  registrationNumber: string;
  location: string;
  description: string;
  walletAddress: string;
  verified: boolean;
  trustPassport: TrustPassport;
}

export interface AuditorIntegrityStats {
  approvalRate: number; // percentage
  avgReviewSeconds: number;
  pairAgreement: Record<string, number>; // otherAuditorId -> percentage
}

export interface Auditor {
  id: string;
  name: string;
  pseudonym: string; // e.g. "Auditor #A1"
  specialty: string;
  walletAddress: string;
  declaredConflicts: string[]; // NGO IDs or Campaign IDs
  integrityStats: AuditorIntegrityStats;
  isCanaryFlagged: boolean;
  status: 'active' | 'suspended';
}

export type CampaignCategory = 'water' | 'education' | 'health' | 'relief';

export type CampaignStatus =
  | 'draft'
  | 'plan_review'
  | 'active'
  | 'completed'
  | 'paused'
  | 'stalled';

export interface Campaign {
  id: string;
  ngoId: string;
  title: string;
  description: string;
  category: CampaignCategory;
  goalAmount: number;
  raisedAmount: number;
  heldAmount: number; // In protected escrow
  releasedAmount: number; // Paid out to NGO
  retainedAmount: number; // In 48h challenge window
  status: CampaignStatus;
  deadline: string; // ISO date
  planApproved: boolean;
  planApprovedBy: string[]; // Auditor IDs who approved the initial plan
  milestones: Milestone[];
  createdAt: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorAddress: string;
  donorName: string;
  amount: number;
  createdAt: string;
  refundClaimed: boolean;
  txHash: string;
}

export type AuditEventType =
  | 'DONATION'
  | 'PLAN_APPROVED'
  | 'PROOF_SUBMITTED'
  | 'VOTE_CAST'
  | 'STAGE_APPROVED'
  | 'RETENTION_HELD'
  | 'FUNDS_RELEASED'
  | 'DISPUTE_FILED'
  | 'DISPUTE_RESOLVED'
  | 'REFUND_CLAIMED'
  | 'TIME_WARPED'
  | 'CANARY_INJECTED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: AuditEventType;
  actorRole: 'donor' | 'ngo' | 'auditor' | 'admin' | 'system';
  actorId: string;
  actorName: string;
  campaignId?: string;
  milestoneId?: string;
  details: string;
  txHash: string;
}

export interface AppState {
  ngos: NGO[];
  auditors: Auditor[];
  campaigns: Campaign[];
  donations: Donation[];
  auditEvents: AuditEvent[];
  simulatedNow: string; // ISO string
}
