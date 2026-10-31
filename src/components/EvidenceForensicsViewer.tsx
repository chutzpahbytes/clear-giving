'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileCheck,
  FileSearch,
  FileText,
  Fingerprint,
  Info,
  MapPin,
  Receipt,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { EvidenceItem, Milestone } from '@/types/models';
import { analyzeEvidence, type ForensicReport } from '@/lib/forensics';
import { formatRupees } from '@/lib/format';

interface EvidenceForensicsViewerProps {
  evidence: EvidenceItem[];
  milestone?: Milestone;
}

export function EvidenceForensicsViewer({
  evidence,
  milestone,
}: EvidenceForensicsViewerProps) {
  const [selectedId, setSelectedId] = useState<string>(
    evidence[0]?.id || ''
  );

  const activeItem = evidence.find((e) => e.id === selectedId) || evidence[0];
  const report: ForensicReport | null = activeItem
    ? analyzeEvidence(activeItem, milestone)
    : null;

  if (!activeItem || !report) {
    return (
      <div className="rounded-xl border-2 border-line bg-surface p-6 text-center text-muted">
        No evidence documents attached to this stage.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Evidence Document Selector */}
      <div className="flex flex-wrap gap-2">
        {evidence.map((item) => {
          const isSelected = item.id === activeItem.id;
          const itemReport = analyzeEvidence(item, milestone);
          const isHighRisk = itemReport.overallRisk === 'high';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`btn text-xs py-1.5 px-3 ${
                isSelected
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {item.fileType === 'receipt' ? (
                <Receipt className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Camera className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="font-semibold">{item.title}</span>
              {isHighRisk && (
                <span className="ml-1 rounded bg-danger px-1 py-0.2 text-[10px] font-bold text-white">
                  RISK
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Inspection Card */}
      <div className="rounded-xl border-2 border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Evidence Forensic Inspection
              </span>
              {activeItem.isCanary && (
                <span className="rounded bg-danger/20 border border-danger px-2 py-0.5 text-xs font-bold text-danger">
                  CANARY TEST PROOF
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold mt-1">{activeItem.title}</h3>
            <p className="text-xs text-muted mt-0.5">{activeItem.description}</p>
          </div>

          {/* Overall Risk Badge (Never color alone) */}
          <div className="text-right">
            <span className="text-xs text-muted block mb-1">Automated Integrity Verdict:</span>
            {report.overallRisk === 'high' && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-danger bg-danger/10 px-3 py-1 text-sm font-bold text-danger">
                <AlertOctagon className="h-4 w-4" aria-hidden="true" />
                HIGH RISK DETECTED
              </span>
            )}
            {report.overallRisk === 'medium' && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-warning bg-warning/10 px-3 py-1 text-sm font-bold text-warning">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                MODERATE RISK (Verify)
              </span>
            )}
            {report.overallRisk === 'low' && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-success bg-success/10 px-3 py-1 text-sm font-bold text-success">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                CLEAN FORENSIC AUDIT
              </span>
            )}
          </div>
        </div>

        {/* IPFS CID & Metadata Ribbon */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs bg-bg p-3 rounded-lg border border-line/40">
          <div>
            <span className="text-muted block">IPFS Cryptographic Hash:</span>
            <span className="font-mono text-ink font-semibold break-all">
              {activeItem.fileHash.slice(0, 16)}...{activeItem.fileHash.slice(-8)}
            </span>
          </div>
          <div>
            <span className="text-muted block">Capture Device:</span>
            <span className="font-semibold text-ink">
              {activeItem.metadata?.camera || 'Digital Camera / Mobile'}
            </span>
          </div>
          <div>
            <span className="text-muted block">Captured Date:</span>
            <span className="font-semibold text-ink">
              {activeItem.metadata?.date || activeItem.uploadedAt}
            </span>
          </div>
        </div>

        {/* 5 Forensic Signal Cards */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-bold text-ink flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Forensic Signal Breakdown</span>
          </h4>

          <div className="grid gap-3 md:grid-cols-2">
            {report.signals.map((sig, idx) => {
              const isPass = sig.status === 'pass';
              const isFail = sig.status === 'fail';
              const isWarn = sig.status === 'warning';

              return (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-3 ${
                    isFail
                      ? 'border-danger/80 bg-danger/5'
                      : isWarn
                      ? 'border-warning/80 bg-warning/5'
                      : 'border-line/60 bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      {sig.category.replace('_', ' ')}
                    </span>
                    {isPass && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        PASS
                      </span>
                    )}
                    {isWarn && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        WARNING
                      </span>
                    )}
                    {isFail && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-danger">
                        <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
                        FAILED
                      </span>
                    )}
                  </div>
                  <h5 className="mt-1 font-bold text-sm text-ink">{sig.title}</h5>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{sig.details}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advisory AI Score Banner */}
        <div className="mt-6 rounded-lg border border-line/60 bg-bg p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="font-bold text-sm">Advisory AI-Generation Score:</span>
              <span
                className={`font-mono text-base font-bold ${
                  report.advisoryAiScore >= 70
                    ? 'text-danger'
                    : report.advisoryAiScore >= 40
                    ? 'text-warning'
                    : 'text-success'
                }`}
              >
                {report.advisoryAiScore}%
              </span>
            </div>
            <span className="text-xs font-semibold text-muted">
              (Model heuristic: frequency & diffusion artifact analysis)
            </span>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-line/20">
            <div
              className={`h-full transition-all ${
                report.advisoryAiScore >= 70
                  ? 'bg-danger'
                  : report.advisoryAiScore >= 40
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
              style={{ width: `${report.advisoryAiScore}%` }}
            />
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              <strong>Crucial Honesty Rule:</strong> This score is advisory only, never an automatic verdict.
              Certified human auditors must physically inspect physical proofs before voting.
            </span>
          </div>
        </div>

        {/* Geolocation Map Pin Callout */}
        {report.gpsDistanceKm !== undefined && (
          <div className="mt-4 rounded-lg border border-line/60 bg-surface p-3 text-xs flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">
                Calculated Distance to Project Site: {report.gpsDistanceKm} km
              </p>
              <p className="text-muted">
                {report.gpsDistanceKm <= 15
                  ? 'Within certified 15 km geographic radius tolerance for Alwar, Rajasthan.'
                  : 'FLAGGED: Location is outside declared project boundaries.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
