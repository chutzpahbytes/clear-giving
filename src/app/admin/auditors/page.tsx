'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AuditorIntegrityPanel } from '@/components/AuditorIntegrityPanel';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function AdminAuditorsPage() {
  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="admin" />

      {/* Top Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Admin Overview</span>
        </Link>
        <Link href="/admin/demo" className="btn btn-secondary text-xs">
          <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>Open Demo Test Console</span>
        </Link>
      </div>

      <section aria-labelledby="auditors-mgmt-title" className="space-y-2">
        <h1 id="auditors-mgmt-title" className="text-3xl font-bold">
          Auditor Panel Pool &amp; Integrity Oversight
        </h1>
        <p className="text-muted text-sm max-w-3xl">
          Platform-level monitoring of the 7-auditor pseudonymous pool. Analyzes statistical approval rates,
          average review durations, pairwise voting agreement, and armed canary proof vigilance traps.
        </p>
      </section>

      {/* Auditor Integrity Panel */}
      <AuditorIntegrityPanel />
    </div>
  );
}
