'use client';

import React, { useState } from 'react';
import { CheckCircle2, Shield, ShieldAlert, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useRole } from '@/providers/RoleProvider';
import type { Role } from '@/types/roles';

interface PowerRule {
  canDo: string[];
  cannotDo: string[];
}

export const ROLE_POWERS: Record<Role, PowerRule> = {
  donor: {
    canDo: [
      'Donate safely to verified charity campaigns with instant escrow receipt',
      'Follow every single rupee through the public audit ledger',
      'View NGO Trust Passport (past completion rate, audit speed, rejected proofs)',
      'Claim automatic pro-rata refund if a campaign misses its stage deadline',
      'File a public dispute during the 48-hour challenge window to freeze retention funds',
    ],
    cannotDo: [
      'Cannot influence or tamper with independent auditor votes',
      'Cannot withdraw funds once a stage milestone is legitimately verified',
      'Cannot direct escrow funds to unverified personal addresses',
    ],
  },
  ngo: {
    canDo: [
      'Propose campaign goal, sequential milestones, and category evidence requirements',
      'Upload real-world execution proof (geotagged photos, lab reports, vendor invoices)',
      'Receive 80% immediate payout upon auditor panel approval',
      'Receive remaining 20% retention automatically after the 48-hour challenge window',
    ],
    cannotDo: [
      'Cannot touch or withdraw escrow funds before independent auditor verification',
      'Cannot modify milestone budgets or deadlines after campaign launch',
      'Cannot choose, contact, or identify the auditors assigned to its review panel',
    ],
  },
  auditor: {
    canDo: [
      'Conduct blind forensic reviews of proof documents (photos, receipts, lab tests)',
      'Inspect automated Evidence Workbench signals (reuse, GPS distance, C2PA, advisory AI)',
      'Cast blind vote (Approve or Reject with mandatory checklist completion)',
      'Earn reputation and maintain active standing in the platform pool',
    ],
    cannotDo: [
      'Cannot see other auditors’ votes until after casting their own vote',
      'Cannot release escrow funds unilaterally (requires 2-of-3 or 3-of-5 threshold)',
      'Cannot vote on campaigns with declared conflicts of interest',
      'Cannot rubber-stamp secret canary proofs without instant suspension',
    ],
  },
  admin: {
    canDo: [
      'Verify NGO registrations and inspect compliance documentation',
      'Manage the 7-auditor pool and monitor integrity / pairwise agreement metrics',
      'Pause a campaign if systemic fraud or law enforcement inquiry occurs',
      'Inject secret platform canary proofs to test auditor vigilance',
    ],
    cannotDo: [
      'Cannot release or transfer escrow funds under any circumstance (enforced by contract rules)',
      'Cannot override or modify auditor voting outcomes',
      'Cannot bypass the 48-hour challenge retention window',
    ],
  },
};

const ROLE_TITLES: Record<Role, string> = {
  donor: 'Donor Trust Boundary',
  ngo: 'Charity (NGO) Trust Boundary',
  auditor: 'Auditor Independent Boundary',
  admin: 'Platform Admin Strict Boundary',
};

export function RolePowersCard({ roleOverride }: { roleOverride?: Role }) {
  const { role: currentRole } = useRole();
  const role = roleOverride || currentRole;
  const [showAllRoles, setShowAllRoles] = useState(false);

  const activePowers = ROLE_POWERS[role];

  return (
    <div className="rounded-xl border-2 border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h3 className="font-bold text-base text-ink">
              {ROLE_TITLES[role]} (Separation of Powers)
            </h3>
            <p className="text-xs text-muted">
              Clear Giving enforces mathematical trust boundaries. No single party can touch or steal funds.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAllRoles(!showAllRoles)}
          className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
        >
          <span>{showAllRoles ? 'Hide Full Matrix' : 'View All 4 Roles Matrix'}</span>
          {showAllRoles ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Active Role Powers Box */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
        {/* Can Do */}
        <div className="rounded-lg border border-success/40 bg-success/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-success uppercase tracking-wider text-[11px]">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>What this role CAN do</span>
          </div>
          <ul className="space-y-1.5 text-ink/90">
            {activePowers.canDo.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-success font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cannot Do */}
        <div className="rounded-lg border border-danger/40 bg-danger/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-danger uppercase tracking-wider text-[11px]">
            <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>What this role CANNOT do (Safeguard)</span>
          </div>
          <ul className="space-y-1.5 text-ink/90">
            {activePowers.cannotDo.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-danger font-bold shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expandable Comparison Matrix for All 4 Roles */}
      {showAllRoles && (
        <div className="mt-5 border-t border-line/40 pt-4 space-y-4">
          <h4 className="text-sm font-bold text-ink">
            Full 4-Role Architecture Comparison Table
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-line">
              <thead className="bg-bg font-bold border-b border-line">
                <tr>
                  <th className="p-2 border-r border-line">Role</th>
                  <th className="p-2 border-r border-line text-success">Can Do (Capabilities)</th>
                  <th className="p-2 text-danger">Cannot Do (Escrow Invariants)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {(['donor', 'ngo', 'auditor', 'admin'] as Role[]).map((r) => (
                  <tr key={r} className={r === role ? 'bg-primary/5 font-medium' : ''}>
                    <td className="p-2.5 font-bold capitalize border-r border-line whitespace-nowrap">
                      {r === 'ngo' ? 'Charity (NGO)' : r}
                      {r === role && <span className="ml-1 text-[10px] text-primary">(Active)</span>}
                    </td>
                    <td className="p-2.5 border-r border-line">
                      <ul className="space-y-1">
                        {ROLE_POWERS[r].canDo.map((c, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-success">✓</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2.5">
                      <ul className="space-y-1">
                        {ROLE_POWERS[r].cannotDo.map((c, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-danger">✕</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
