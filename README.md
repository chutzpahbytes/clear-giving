# Clear Giving

**"Razorpay for trust": transparent, milestone-based charity donations.**

Built for SPHINX'26 (24-hour hackathon, MNIT Jaipur) · Problem Statement 3.3: *Transparent Charity Donations on the Blockchain*

> **Live demo:** `<add your Vercel link here>`
> **Demo walkthrough:** see [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)
> All charities, donors and auditors in the demo are **fictional**. No real money is used.

---

## The problem

Donors give blind. Once money leaves their account they cannot tell whether a well was dug or a classroom was built. Charities that do honest work suffer too, because donors have no way to tell them apart from the ones that don't.

Most "blockchain donation trackers" only prove that **money moved**. They cannot prove that **the real-world work happened**. That verification step is the hard part, and it is the part Clear Giving is designed around.

## Our solution

Donations go into a **protected fund**, not to the charity. The charity gets paid **stage by stage**, only after an independent, anonymous panel of auditors reviews its proof. The rules are enforced by the system, not by trust in any person.

**The flow**

1. An Admin verifies the charity.
2. The charity proposes a campaign with 3 to 4 stages. Each stage lists the evidence it must provide, based on a category template.
3. Donors see the charity's **Trust Passport** (track record) and donate into the protected fund.
4. The charity uploads proof for Stage 1.
5. A randomly drawn, pseudonymous panel of auditors reviews the proof in the **Evidence Workbench** and votes **blind**.
6. If approved, **80% is paid immediately and 20% is held for 48 hours** so anyone can challenge the decision.
7. Every action is written to a public ledger (**Follow the Money**).
8. If the charity goes silent past a deadline, donors can claim back their share of the unspent money.

## What makes it different

| Standard solution | What we add |
|---|---|
| Charity posts a goal | **Trust Passport:** on-time rate, rejected proofs, flags, average audit time, shown to donors *before* they give |
| Charity sets milestones | **Category templates with required-evidence checklists**; stages cannot be vague |
| Funds held in escrow | **Refund-if-stalled:** stage deadlines; donors reclaim unspent money if the charity goes silent |
| Auditor approves proof | **Blind voting, random pseudonymous panels, conflict exclusion**, and **3-of-5 panels for stages of ₹1,00,000 or more** (2-of-3 otherwise) |
| (not usually considered) | **Review gate:** voting is locked until the auditor opens every evidence item, completes the checklist and spends a minimum review time |
| Funds released | **80/20 retention + 48-hour public challenge window.** A dispute freezes the held amount and triggers a fresh re-review panel |
| (not usually considered) | **Auditor Integrity panel + canary proofs:** known-fake proofs test whether auditors are really checking |
| Transaction list | **Planned vs. reported impact** (for example "target 500 students, reported 210") and a public ledger |

## Honest about collusion

No system can make collusion impossible: software cannot verify the physical world on its own (the "oracle problem"). Our goal is to make collusion **hard to organise, quick to detect, expensive to repeat, and limited in damage**:

- **Prevent:** pseudonymous panels, random draw, conflict exclusion, blind voting, larger panels for larger payouts.
- **Rubber-stamp gate:** minimum review time and a mandatory evidence checklist.
- **Detect:** integrity statistics and canary proofs.
- **Limit damage:** 80/20 retention, public challenge, re-review. The worst case is one stage's 80%, never the whole campaign.

## Evidence Workbench (advisory signals)

For each proof, the auditor sees five signals: **reuse check**, **location (EXIF) match**, **provenance (C2PA) check**, **AI-likelihood score**, and **receipt vs. claimed spend**. The AI score is always labelled **advisory, not a verdict**. A human always decides.

## Four roles, one trust model

| Role | Can do | Cannot do |
|---|---|---|
| **Donor** | Give, see charity history, follow every rupee, claim refund if stalled, dispute within the window | Influence votes |
| **Charity (NGO)** | Propose a plan, upload proof | Touch protected funds, edit stages after launch, choose its auditors |
| **Auditor** | Review evidence, vote blind | See other votes before voting, vote twice, release money alone |
| **Admin** | Verify charities, manage the auditor pool, pause a suspicious campaign | Release funds or override votes |

Use the **Role Switcher** in the header to see each view.

## Accessibility (designed for elderly and specially-abled users)

- Page-wide text scaling up to 175%
- High-contrast mode
- Plain-language mode (Web3 jargon hidden by default; a toggle shows the technical terms)
- Reduced-motion switch
- Read-aloud, click-to-listen and a dyslexia-friendly mode
- Skip link, visible focus rings, status always shown in words and icons, never colour alone

## What is real and what is simulated

We want to be clear about this.

| Area | Status |
|---|---|
| Escrow rules (staging, 80/20, 48h window, refunds, disputes, panels, blind voting, review gate) | **Implemented** in a client-side simulation engine that saves to the browser |
| Four role views, Trust Passport, Follow the Money, Auditor Integrity panel, canary proofs, demo controls (including fast-forward time) | **Implemented** |
| Accessibility features | **Implemented** |
| Evidence signals (reuse, location, provenance, AI score, receipt match) | **Simulated.** They run against sample evidence data and values entered in the demo; they do not analyse real image pixels yet |
| Proof storage | **Real Pinata IPFS upload is wired** when a `PINATA_JWT` key is configured; otherwise a SHA-256 based placeholder ID is used |
| Smart contract | **Written** in Solidity (`contracts/`) but **not yet deployed or connected** to the app. The app runs on the simulator |
| "Chain Mode" toggle | A preview of the planned switch; it does not yet talk to a blockchain |
| Auditor identities, charities, donors, receipt numbers | **Fictional sample data** |

## Roadmap

1. Deploy the escrow contract to Polygon Amoy testnet and connect it behind the existing service layer (the app is built so the engine can be swapped).
2. Real image analysis for the Evidence Workbench (perceptual hashing, EXIF and C2PA parsing, a hosted AI-image detector as an advisory signal).
3. Auditor bonds with slashing, and beneficiary confirmation by SMS link (for example from a school principal).
4. An embeddable "Verified by Clear Giving" donate-and-track widget for charities' own websites.
5. Hindi and regional-language interface.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · lucide-react · ethers.js v6 · Solidity 0.8 · Pinata (IPFS)

The app talks to a single **service layer**. Today it is backed by the simulator, so the demo cannot fail on stage; the same interface is designed to sit in front of a smart contract.

## Run it locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address printed in the terminal (usually http://localhost:3000).

Optional: to enable real IPFS uploads, create a `.env.local` file with `PINATA_JWT=your_key`. The app works without it.

## Try the demo

The home page loads a consistent sample story (**"Clean Water for Village Schools"** by the fictional Jal Seva Foundation). Switch roles from the header to see each view. The **Demo Controls** page (`/admin/demo`) has "Load Sample Data", "Fast-forward 48 hours" and other helpers. A step-by-step script is in [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

## Project structure

```
src/app/          Pages for each role (campaigns, ngo, auditor, admin, audit, my-giving)
src/components/   Accessibility bar, role switcher, role-powers card, evidence viewer, integrity panel
src/lib/          Rules, sample data, forensics, service layer (simulator)
src/providers/    Accessibility, role and app-state providers
contracts/        Solidity escrow contracts (not yet deployed)
scripts/          Compile and deploy helpers
```

## Team

`<add team name and members here>`

## Disclaimer

This is a hackathon prototype. It is not a regulated financial or fundraising product. All people, organisations and amounts shown are fictional.
