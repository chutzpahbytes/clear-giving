# Clear Giving — 3-Minute Hackathon Demo Script & Pitch Walkthrough

> **Platform Tagline:** *"Razorpay for Trust: Transparent Milestone Charity Escrow"*  
> **Key Value Proposition:** No human can embezzle or rubber-stamp funds. Every rupee is locked in decentralized smart contract escrow and released in 80/20 sequential stages after pseudonymous multi-auditor verification.

---

## ⏱ 3-Minute Presentation Breakdown

### 0:00 – 0:45 | The Problem & "Razorpay for Trust" (Founder Pitch)
- *"Every year, millions of donors want to give, but don't because they don't know where the money goes. Traditional charity platforms act like simple buckets: once you donate, the money is gone with zero accountability."*
- *"Clear Giving is Razorpay for Trust. We replace blind trust with mathematical escrow. Verified charities propose sequential milestones, donors contribute to a protected smart contract, and funds are only disbursed after independent auditor panels inspect real-world evidence."*

---

### 0:45 – 1:30 | Separation of Powers & The Donor Journey (Live Demo)
1. **Show Role Powers Matrix (Home / Campaigns):**
   - Click the **RolePowersCard** at the top of the page.
   - Point out the trust boundaries: *"Notice the separation of powers: Donors cannot tamper with votes; NGOs cannot touch money before verification; Auditors cannot release money alone; and Platform Admins can never withdraw funds."*
2. **Browse Marketplace (`/campaigns`):**
   - Show **Jal Seva Foundation's Trust Passport**: 100% on-time completion, past audit records, and 92/100 score.
   - Click **"Donate Now"** on "Clean Water for Village Schools".
   - Enter ₹2,500 and confirm. Show that the funds are instantly locked in escrow, not transferred to the NGO's pocket.

---

### 1:30 – 2:15 | The Auditor Review Gate & Evidence Workbench
1. **Switch to Auditor (`RoleSwitcher` -> "Auditor"):**
   - The app navigates directly to `/auditor`.
   - Explain: *"Auditors operate pseudonymously as Auditor #A1, #A2, etc. They cannot see each other's identities or votes until their own is cast (Blind Voting)."*
2. **Open Evidence Forensics Workbench:**
   - Click through the **5 Automated Scrutiny Signals**:
     1. **Perceptual Reuse Check:** No duplicate image in cross-campaign registry.
     2. **EXIF Geotag:** Coordinates match target school in Alwar, Rajasthan within 2.4 km.
     3. **C2PA Provenance:** Certified camera sensor cryptographic header.
     4. **Advisory AI-Likelihood Score:** 12% (Clean optical lens patterns). *Honesty rule: Advisory signal only — human auditor decides.*
     5. **Invoice Reconciliation:** ₹80,000 matches stage budget allocation.
3. **The Rubber-Stamp Gate:**
   - Attempt to click Vote — show it's locked.
   - Complete the 3 checklist items and wait for the 15-second minimum review timer.
   - Click **"Cast Blind Vote: APPROVE"**.
   - **The Wow Moment:** Show the 80/20 split: **₹64,000 (80%) paid out immediately to NGO**, and **₹16,000 (20%) held in the 48-hour challenge window**!

---

### 2:15 – 2:45 | Defeating Collusion with Canary Traps (`/admin/auditors` or `/admin/demo`)
1. **Switch to Admin (`RoleSwitcher` -> "Admin"):**
   - Navigate to `/admin/auditors` or `/admin/demo`.
   - Explain: *"Judges always ask: What if an NGO bribes the auditors? Can't they just collude?"*
   - *"Our answer: Collusion cannot be made mathematically impossible, so we make it hard to organize, quick to detect, and expensive to repeat."*
2. **Trigger the Canary Trap Live:**
   - Click **"Inject Secret Canary Proof"**.
   - Show that a synthetic proof with Mumbai coordinates and an inflated ₹95k invoice was slipped into the queue.
   - Click **"Test Rubber-Stamp Trap (Auditor #A4)"**.
   - **Result:** Auditor #A4 approved blindly without scrutiny — the Canary Oracle instantly flags and **SUSPENDS Auditor #A4 from all platform panels**!

---

### 2:45 – 3:00 | 48-Hour Retention, Stalled Refunds & Accessibility
1. **Fast-Forward 48 Hours:**
   - Click **"Fast-forward 48 Hours"** in the Demo Console to demonstrate automatic release of the 20% retention after zero public disputes.
2. **Stalled Campaign Donor Protection:**
   - Show **"Fast-forward 65 Days (Past Deadline)"** -> click **"Claim Pro-Rata Refund"** as donor Vikramaditya to show how unspent escrow is returned to donors if a project stalls.
3. **Show Accessibility Excellence:**
   - Open the top **Accessibility & Reading Tools** panel.
   - Toggle **"Dyslexia-Friendly Mode"** (instant high-legibility typography).
   - Toggle **"Stop Animations"** -> show the animation test bench freezing immediately (`[PAUSED: Reduced Motion Active]`).
   - Click **"Read This Page"** to let the browser read aloud with sentence highlighting.

---

## 🏆 Key Talking Points for Q&A with Judges

| Question | Winning Answer |
| :--- | :--- |
| **Why not release 100% immediately?** | We borrowed the 80/20 retention rule from large infrastructure construction contracts. 80% covers immediate material costs; 20% remains locked during a 48-hour public challenge window so donors or villagers can dispute shoddy work before the NGO walks away. |
| **What happens if an NGO goes silent?** | Every stage has a strict deadline. If the deadline passes without proof submission, donors can click "Claim Refund" to withdraw their pro-rata share of unspent escrow. No other donation platform offers this. |
| **Can the platform admin steal the funds?** | No. In our smart contract, the `admin` role can register auditors or pause campaigns, but `onlyNGO` can receive payouts, and `onlyAuditors` can unlock stages. The admin address is cryptographically prevented from withdrawing funds. |
| **How does AI detection work?** | We are intellectually honest: no AI detector is 100% reliable. We present it as advisory forensic signals (frequency anomalies, perceptual reuse, EXIF metadata) that empower the human auditor, rather than claiming false perfection. |
