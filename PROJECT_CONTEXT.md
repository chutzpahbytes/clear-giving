# Clear Giving - Project Context

## 1. Overview
Clear Giving ("Razorpay for trust") is a transparent milestone charity escrow platform.
It combines a public marketplace for verified charities with a smart-contract escrow engine that holds donor funds safely and releases them only after independent auditor verification and challenge retention windows.

## 2. Architecture & Tech Stack
- **Framework:** Next.js 14+ (App Router) with TypeScript & TailwindCSS.
- **Simulator-First Architecture:** Full business rules and escrow logic run client-side with persistent storage, ready to swap to Polygon Amoy smart contract.
- **Role Modes:** Donor, Charity (NGO), Auditor, Admin.
- **Accessibility First:** Plain-language dictionary, text scaling (up to 175%), high contrast, screen reader aria, reduced motion.

## 2c. Anti-Collusion Design (APPROVED)
- **Principle:** Collusion cannot be made mathematically impossible (oracle problem: chain cannot verify the real physical world without human inputs). Goal = hard to organise, quick to detect, costly to repeat, bounded damage.
- **Layer 1 (Prevent):**
  - Pseudonymous panels (auditors shown as "Auditor #A1", panel members cannot identify each other, NGO cannot identify auditors).
  - Random draw with conflict exclusion (declared conflicts + auditors who audited same NGO too often recently).
  - Blind voting: auditors cannot see other votes until their own vote is cast.
  - Variable panel sizing: stage payout >= ₹1,00,000 uses 3-of-5 panel; stages < ₹1,00,000 use 2-of-3 panel.
- **Layer 2 (Rubber-Stamp Gate):**
  - Vote button locked until auditor opens every evidence document, completes the stage evidence checklist, and spends minimum review time (15s minimum).
- **Layer 3 (Detect):**
  - Auditor Integrity panel in Admin (tracking approval rate, average review seconds, pairwise agreement, flags like "Always approves", "Votes under 20s").
  - Canary proofs: platform secret test proofs to catch rubber-stamping auditors.
- **Layer 4 (Limit Damage):**
  - 80/20 RETENTION: Approved stage pays 80% immediately to NGO, 20% retained during a 48-hour challenge window.
  - 48h Challenge Window: Held 20% is released after 48h with zero disputes (or when next stage proof accepted).
  - Public Challenge: Any donor or auditor can file a dispute with evidence -> freezes held amount and triggers fresh 5-auditor re-review.
  - Bounded loss: worst case collusion only affects one stage's 80%, never the entire campaign, and donor refund path protects remaining escrow.
  - Admin "Fast-forward 48 hours" demo button.

## 3. Core Data Models & Flow
- **Milestone statuses:** `locked` | `awaiting_proof` | `under_review` | `approved_in_challenge` | `released` | `rejected` | `flagged` | `disputed`.
- **Milestone fields:** `panelSize` (3 or 5), `requiredApprovals` (2 or 3), `retainedAmount`, `challengeEndsAt`, `disputes[]`.
- **Auditor fields:** `pseudonym` (e.g. "Auditor #A1"), `declaredConflicts[]`, `integrityStats` { approvalRate, avgReviewSeconds, pairAgreement }, `isCanaryFlagged`. Pool = 7 auditors.
- **Vote fields:** `reviewSeconds`, `openedAllEvidence` (bool), `checklistAnswers[]`.
- **Dispute:** `id`, `milestoneId`, `campaignId`, `filedBy`, `reason`, `evidence`, `status`, `reReviewPanel[]`.
- **Escrow rules:**
  - Stages executed in sequence.
  - Payout = 80% immediate, 20% retained during 48h challenge window.
  - Dispute freezes retention and triggers 5-auditor panel.
  - Missed deadline -> Pro-rata donor refund.
  - Every action appends an `AuditEvent`.

## 4. Current State & Checklist
- [x] Problem deconstruction & strategic planning
- [x] Architecture & decisions (simulator-first, multi-auditor voting, Next 14 + TS)
- [x] Step 1: Layout & accessibility foundation (AppShell, AccessibilityBar, RoleSwitcher, Plain-language dictionary)
- [x] Founder APPROVED revised Step 2 plan & Anti-Collusion Design (2c)
- [x] STEP 2a Complete:
  - `types/models.ts`
  - `lib/rules.ts`
  - `lib/services/types.ts`
  - `lib/services/simulatorService.ts`
  - `lib/services/index.ts`
  - `lib/ipfs.ts`
  - `lib/sampleData.ts` (7 auditors, Jal Seva hero story, 2 supporting samples)
  - `lib/format.ts`
  - `providers/AppStateProvider.tsx`
  - `providers/AppProviders.tsx` (integrated)
  - `app/admin/demo/page.tsx` (Test console with Cast Deciding Vote, Fast-forward 48h, Fast-forward 65d, Dispute, Refund)
- [x] STEP 2b Complete:
  - `lib/forensics.ts` (Perceptual reuse check, EXIF metadata/geotag matching, C2PA provenance, advisory AI score, receipt budget check)
  - `components/AuditorIntegrityPanel.tsx` (Pool stats, approval rate, review speed, pairwise agreement matrix, canary injection and rubber-stamp detection)
  - `components/EvidenceForensicsViewer.tsx` (Multi-layered evidence inspection viewer)
  - `providers/AccessibilityProvider.tsx` (Page-wide zoom, Web Speech API read aloud with pause/resume/rate, click-to-listen sentence highlighter, dyslexia mode)
  - `components/AccessibilityBar.tsx` (Collapsible compact bar and expandable options drawer)
  - `app/globals.css` (Dyslexia typography, speech highlight, reduced motion handling)
  - `app/admin/demo/page.tsx` (Integrated tabs for Escrow Simulation, Evidence Forensics, Auditor Integrity, and Reduced Motion Verification)
- [x] STEP 3 Complete:
  - `components/RolePowersCard.tsx` (Separation of powers trust boundary matrix for all 4 roles)
  - `app/campaigns/page.tsx` (Donor marketplace: verified causes, Trust Passport, escrow filter, donation modal)
  - `app/campaigns/[id]/page.tsx` (Campaign detail: sequential stages, 80/20 retention, planned vs reported impact, attached Evidence Forensics, stalled refund button)
  - `app/my-giving/page.tsx` (My Giving: donor receipts, tracked contributions, verified certificates)
  - `app/audit/page.tsx` (Follow the Money: public ledger of every rupee, tx hash, stage transitions)
  - `app/ngo/page.tsx` (Charity dashboard: Jal Seva campaigns, milestone stages, held funds vs released)
  - `app/campaigns/new/page.tsx` (Start a Campaign: stage builder, category templates, 20-second demo fill button)
  - `app/ngo/proof/page.tsx` (Upload Proof: photo/receipt upload, EXIF geotagging, claimed amount)
  - `app/auditor/page.tsx` (Proofs to Check: blind review queue, checklist gate, 15s scrutiny timer, blind vote cast)
  - `app/auditor/history/page.tsx` (My Past Votes: voting history, timestamps, scrutiny review times)
  - `app/admin/page.tsx` (Platform Overview: escrow health, dispute queue, verified NGO registry)
  - `app/admin/auditors/page.tsx` (Auditor Panel & Canary: 7-auditor pool, pairwise matrix, canary injection)
  - `app/page.tsx` (Home page with dynamic RolePowersCard and quick workflow routing for all 4 roles)
- [x] STEP 4 Complete:
  - `contracts/ClearGivingEscrow.sol` (Solidity smart contract with 7-auditor pool, variable thresholds, 80/20 retention, 48h challenge window, dispute re-review, and stalled pro-rata refund)
  - `scripts/deployToAmoy.js` & `src/lib/contracts/deploymentConfig.json` (Polygon Amoy deployment configuration, Chain ID 80002)
  - `src/lib/contracts/ClearGivingEscrowABI.json` (Contract ABI)
  - `src/app/api/ipfs/upload/route.ts` (Real Pinata IPFS upload route with fallback)
  - `src/components/AppShell.tsx` (Polygon Amoy Chain Mode vs Offline Simulator Mode toggle)
  - `DEMO_SCRIPT.md` (3-minute stage pitch script & step-by-step presentation walkthrough)
  - Automatic Role Switching Navigation: clicking Donor, Charity, Auditor, or Admin instantly routes to their dedicated portal with 0 errors!
- [x] ALL ROADMAP TIERS COMPLETE AND VERIFIED IN LIVE BROWSER
