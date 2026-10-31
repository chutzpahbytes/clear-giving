import type {
  Auditor,
  Campaign,
  ChecklistAnswer,
  ChecklistCriterion,
  Milestone,
  Vote,
} from '@/types/models';

export const LARGE_STAGE_THRESHOLD = 100000; // Rs 1,00,000 threshold for 3-of-5 panel
export const RETENTION_RATE = 0.2; // 20% held back in challenge window
export const IMMEDIATE_PAYOUT_RATE = 0.8; // 80% paid immediately
export const CHALLENGE_WINDOW_HOURS = 48; // 48 hours challenge window
export const MIN_REVIEW_SECONDS = 15; // Review gate minimum seconds

/**
 * Calculates panel size and required approvals based on the stage payout amount.
 * - Stage payout >= Rs 1,00,000 -> 3-of-5 panel
 * - Stage payout < Rs 1,00,000 -> 2-of-3 panel
 */
export function getPanelRequirements(payoutAmount: number): {
  panelSize: 3 | 5;
  requiredApprovals: 2 | 3;
} {
  if (payoutAmount >= LARGE_STAGE_THRESHOLD) {
    return { panelSize: 5, requiredApprovals: 3 };
  }
  return { panelSize: 3, requiredApprovals: 2 };
}

/**
 * Calculates 80% immediate release and 20% retention amount for an approved stage.
 */
export function calculateRetentionSplit(stageAmount: number): {
  immediatePayout: number;
  retainedAmount: number;
} {
  const retainedAmount = Math.round(stageAmount * RETENTION_RATE);
  const immediatePayout = stageAmount - retainedAmount;
  return { immediatePayout, retainedAmount };
}

/**
 * Selects pseudonymous auditors from the pool while excluding conflicts
 * and auditors who recently audited this NGO.
 */
export function drawAuditorPanel(
  pool: Auditor[],
  ngoId: string,
  campaignId: string,
  panelSize: 3 | 5,
  excludeAuditorIds: string[] = []
): Auditor[] {
  const eligible = pool.filter((auditor) => {
    if (auditor.status !== 'active') return false;
    if (excludeAuditorIds.includes(auditor.id)) return false;
    if (auditor.declaredConflicts.includes(ngoId)) return false;
    if (auditor.declaredConflicts.includes(campaignId)) return false;
    return true;
  });

  if (eligible.length < panelSize) {
    // If not enough without exclusion, fallback to all active non-conflicted
    const fallback = pool.filter(
      (a) => a.status === 'active' && !a.declaredConflicts.includes(ngoId)
    );
    return fallback.slice(0, panelSize);
  }

  // Shuffle or deterministic draw
  return [...eligible].sort(() => 0.5 - Math.random()).slice(0, panelSize);
}

/**
 * Evaluates the review gate:
 * - Auditor must open all evidence items
 * - Auditor must spend at least MIN_REVIEW_SECONDS
 * - Auditor must answer all required checklist criteria
 */
export function checkReviewGate(
  openedAllEvidence: boolean,
  reviewSeconds: number,
  criteria: ChecklistCriterion[],
  answers: ChecklistAnswer[]
): { passed: boolean; reason?: string } {
  if (!openedAllEvidence) {
    return { passed: false, reason: 'You must inspect all evidence documents before voting.' };
  }
  if (reviewSeconds < MIN_REVIEW_SECONDS) {
    return {
      passed: false,
      reason: `Review gate: Please take at least ${MIN_REVIEW_SECONDS} seconds to evaluate evidence (spent: ${reviewSeconds}s).`,
    };
  }
  const requiredCriteria = criteria.filter((c) => c.required);
  const answeredIds = new Set(answers.map((a) => a.criterionId));
  const missing = requiredCriteria.filter((c) => !answeredIds.has(c.id));
  if (missing.length > 0) {
    return {
      passed: false,
      reason: `Please answer all checklist criteria: missing "${missing[0].question}"`,
    };
  }
  return { passed: true };
}

/**
 * Determines outcome of votes on a milestone.
 * Blind voting rules:
 * - If approved count >= requiredApprovals -> 'approved'
 * - If rejected count > (panelSize - requiredApprovals) -> 'rejected'
 * - Otherwise -> 'pending'
 */
export function evaluateVotesOutcome(
  milestone: Milestone
): {
  outcome: 'approved' | 'rejected' | 'pending';
  approveCount: number;
  rejectCount: number;
  votesRemaining: number;
} {
  const votes = milestone.votes || [];
  const approveCount = votes.filter((v) => v.decision === 'approve').length;
  const rejectCount = votes.filter((v) => v.decision === 'reject').length;
  const votesRemaining = milestone.panelSize - votes.length;

  if (approveCount >= milestone.requiredApprovals) {
    return { outcome: 'approved', approveCount, rejectCount, votesRemaining };
  }

  const maxPossibleRejectsAllowed = milestone.panelSize - milestone.requiredApprovals;
  if (rejectCount > maxPossibleRejectsAllowed) {
    return { outcome: 'rejected', approveCount, rejectCount, votesRemaining };
  }

  return { outcome: 'pending', approveCount, rejectCount, votesRemaining };
}

/**
 * Checks whether an auditor can view existing votes.
 * Blind voting rule: Auditor can ONLY see other votes AFTER having cast their own vote.
 */
export function canAuditorSeeVotes(milestone: Milestone, auditorId?: string): boolean {
  if (!auditorId) return false;
  return milestone.votes.some((v) => v.auditorId === auditorId);
}

/**
 * Checks if a campaign is eligible for a donor refund.
 * Rule: Stalled campaign, or deadline passed with incomplete milestones.
 */
export function checkRefundEligibility(
  campaign: Campaign,
  simulatedNow: string
): { eligible: boolean; reason?: string } {
  if (campaign.status === 'stalled') {
    return { eligible: true, reason: 'Campaign is marked as stalled due to inactivity.' };
  }
  const deadlineDate = new Date(campaign.deadline).getTime();
  const nowDate = new Date(simulatedNow).getTime();

  if (nowDate > deadlineDate && campaign.status !== 'completed') {
    return {
      eligible: true,
      reason: `Deadline passed on ${new Date(campaign.deadline).toLocaleDateString()} without completion.`,
    };
  }
  return { eligible: false, reason: 'Campaign is currently active within its deadline.' };
}
