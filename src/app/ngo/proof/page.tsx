'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileCheck,
  FileText,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatRupees } from '@/lib/format';
import { RolePowersCard } from '@/components/RolePowersCard';

export default function UploadProofPage() {
  const router = useRouter();
  const { state, actions } = useAppState();

  const heroCampaign = state.campaigns.find((c) => c.id === 'camp-hero') || state.campaigns[0];
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(
    heroCampaign.milestones[1]?.id || heroCampaign.milestones[0]?.id
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'receipt'>('image');
  const [claimedAmount, setClaimedAmount] = useState<number>(80000);
  const [camera, setCamera] = useState('Nikon Z50 Geotagged Field Unit');
  const [lat, setLat] = useState('27.5530');
  const [lng, setLng] = useState('76.6346');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedMilestone =
    heroCampaign.milestones.find((m) => m.id === selectedMilestoneId) || heroCampaign.milestones[0];

  // Quick fill genuine proof
  const handleFillGenuine = () => {
    setTitle('Solar Submersible Pump Operational Test Photo');
    setDescription(
      'Live site photo of installed 3.5HP solar pump with stainless steel casing delivering clear water at Govt School, Alwar District.'
    );
    setFileType('image');
    setClaimedAmount(80000);
    setCamera('Samsung Galaxy S23 Enterprise Field Unit');
    setLat('27.5530');
    setLng('76.6346');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      actions.submitProof(heroCampaign.id, selectedMilestone.id, {
        title,
        description,
        fileUrl: '/sample-proofs/hero-solar-pump.jpg',
        fileType,
        claimedAmount: Number(claimedAmount),
        metadata: {
          date: new Date().toISOString().split('T')[0],
          location: 'Govt Upper Primary School, Alwar, Rajasthan',
          gpsCoords: { lat: Number(lat), lng: Number(lng) },
          camera,
          c2pa: true,
          isAIAdvisoryScore: 8,
          isReused: false,
        },
      });

      setSuccessMsg(
        `Proof "${title}" uploaded to IPFS and submitted to the blind auditor panel! Stage status is now under review.`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting proof');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="ngo" />

      {/* Top Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/ngo" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Charity Dashboard</span>
        </Link>

        <button
          type="button"
          onClick={handleFillGenuine}
          className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-primary text-primary"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>Fill Sample Verified Proof (20s Demo)</span>
        </button>
      </div>

      <section aria-labelledby="upload-title" className="space-y-2">
        <h1 id="upload-title" className="text-3xl font-bold">
          Submit Stage Execution Proof
        </h1>
        <p className="text-muted text-sm max-w-3xl">
          Upload geotagged visual evidence, state lab test results, or vendor tax receipts. Files are pinned to
          simulated IPFS and subjected to automated forensic checks before blind auditor review.
        </p>
      </section>

      {successMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="flex items-start justify-between gap-4 rounded-xl border-2 border-success bg-success/10 p-4 font-semibold text-ink"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" aria-hidden="true" />
            <p className="text-sm">{successMsg}</p>
          </div>
          <Link href={`/campaigns/${heroCampaign.id}`} className="text-xs font-bold underline">
            View in Milestone Stages →
          </Link>
        </aside>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-4">
          <h2 className="text-lg font-bold text-ink">1. Target Milestone Stage</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Select Campaign</label>
              <input
                type="text"
                disabled
                value={heroCampaign.title}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-xs font-semibold text-muted"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Select Milestone Stage</label>
              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                {heroCampaign.milestones.map((ms) => (
                  <option key={ms.id} value={ms.id}>
                    Stage {ms.order}: {ms.title} ({formatRupees(ms.targetAmount)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-4">
          <h2 className="text-lg font-bold text-ink">2. Document Details &amp; Forensic Metadata</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Document Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pump Installation Geotagged Photo"
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Document Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-semibold focus:border-primary focus:outline-none"
              >
                <option value="image">On-site Field Photo (JPEG/PNG)</option>
                <option value="pdf">Certified Lab Report / Inspection Certificate</option>
                <option value="receipt">Itemized Contractor Tax Invoice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Description &amp; Context</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background, serial numbers, and physical handover observations..."
              className="w-full rounded-lg border-2 border-line bg-bg p-2 text-xs leading-relaxed focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Invoice Claim (INR ₹)</label>
              <input
                type="number"
                required
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-xs font-bold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">EXIF Latitude</label>
              <input
                type="text"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">EXIF Longitude</label>
              <input
                type="text"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Forensic Invariant Advisory Notice */}
          <div className="rounded-lg border border-line/60 bg-bg p-3 text-xs text-muted flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Uploaded files are scanned by the Evidence Workbench for perceptual reuse, EXIF geotag matching,
              C2PA credentials, and advisory AI signatures before reaching the 2-of-3 blind auditor panel.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/ngo" className="btn btn-secondary text-sm">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary text-sm px-6">
            Upload &amp; Submit for Audit
          </button>
        </div>
      </form>
    </div>
  );
}
