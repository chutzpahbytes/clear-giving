'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Droplets,
  Heart,
  Layers,
  MapPin,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { formatRupees } from '@/lib/format';
import { useLabel } from '@/hooks/useLabel';
import { RolePowersCard } from '@/components/RolePowersCard';
import type { CampaignCategory } from '@/types/models';

export default function CampaignsMarketplacePage() {
  const { state, actions } = useAppState();
  const t = useLabel();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [donatingCampaignId, setDonatingCampaignId] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(2500);
  const [donorName, setDonorName] = useState<string>('Aarav Mehta');
  const [donationSuccess, setDonationSuccess] = useState<string | null>(null);

  const campaigns = state.campaigns.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donatingCampaignId) return;

    try {
      const donation = actions.donate(donatingCampaignId, Number(donationAmount), donorName);
      setDonationSuccess(
        `Thank you, ${donorName}! Your contribution of ${formatRupees(
          donation.amount
        )} is safely locked in smart escrow. It will only be disbursed after independent auditors verify stage milestones.`
      );
      setDonatingCampaignId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error making donation');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Role Powers Callout */}
      <RolePowersCard roleOverride="donor" />

      {/* Page Header */}
      <section aria-labelledby="marketplace-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 id="marketplace-title" className="text-3xl font-bold">
              Verified Causes &amp; Milestone Escrow Marketplace
            </h1>
            <p className="mt-1 text-muted text-base max-w-3xl">
              Every rupee you donate sits in a protected smart contract escrow. Funds are released strictly in stages
              after pseudonymous auditor panels verify real-world evidence.
            </p>
          </div>
          <Link href="/audit" className="btn btn-secondary text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Follow the Money (Audit Ledger)</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-line bg-surface p-3">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'water', 'education', 'health', 'relief'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-fg'
                    : 'bg-bg text-muted hover:text-ink border border-line/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search causes or NGOs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-2 border-line bg-bg py-1.5 pl-9 pr-3 text-xs font-medium focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Donation Success Toast */}
      {donationSuccess && (
        <aside
          role="status"
          aria-live="polite"
          className="flex items-start justify-between gap-4 rounded-xl border-2 border-success bg-success/10 p-4 font-semibold text-ink"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" aria-hidden="true" />
            <p className="text-sm">{donationSuccess}</p>
          </div>
          <button
            type="button"
            onClick={() => setDonationSuccess(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Campaigns Grid */}
      <section aria-labelledby="causes-grid-heading" className="space-y-4">
        <h2 id="causes-grid-heading" className="text-xl font-bold">
          {campaigns.length} Active Verified Campaigns
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((camp) => {
            const ngo = state.ngos.find((n) => n.id === camp.ngoId);
            const percentFunded = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));
            const completedStages = camp.milestones.filter((m) => m.status === 'released').length;
            const activeStage = camp.milestones.find(
              (m) => m.status === 'under_review' || m.status === 'approved_in_challenge' || m.status === 'awaiting_proof'
            );

            return (
              <div
                key={camp.id}
                className="flex flex-col justify-between rounded-xl border-2 border-line bg-surface p-5 transition-shadow hover:shadow-md"
              >
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                      {camp.category}
                    </span>
                    <span className="flex items-center gap-1 rounded bg-bg px-2 py-0.5 text-xs font-semibold text-muted border border-line/40">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>{camp.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 text-lg font-bold text-ink">
                    <Link href={`/campaigns/${camp.id}`} className="hover:text-primary transition-colors">
                      {camp.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* NGO Trust Passport Summary */}
                  {ngo && (
                    <div className="mt-4 rounded-lg border border-line/60 bg-bg p-2.5 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-ink">{ngo.name}</span>
                        <span className="inline-flex items-center gap-1 text-success">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Trust Score: {ngo.trustPassport.score}/100</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                        <span>{ngo.trustPassport.completedCampaigns} past completed</span>
                        <span>•</span>
                        <span>{ngo.trustPassport.onTimeRate}% on-time</span>
                      </div>
                    </div>
                  )}

                  {/* Escrow Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">
                        {formatRupees(camp.raisedAmount)}
                        <span className="font-normal text-muted"> of {formatRupees(camp.goalAmount)}</span>
                      </span>
                      <span className="font-bold text-primary">{percentFunded}%</span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/20">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentFunded}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestone Stages Summary */}
                  <div className="mt-4 flex items-center justify-between text-xs border-t border-line/40 pt-3 text-muted">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>
                        {completedStages} of {camp.milestones.length} stages released
                      </span>
                    </span>
                    <span className="font-semibold text-primary">
                      {formatRupees(camp.heldAmount)} protected
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 grid grid-cols-2 gap-2 pt-2 border-t border-line/40">
                  <Link
                    href={`/campaigns/${camp.id}`}
                    className="btn btn-secondary text-xs py-2 px-3 justify-center"
                  >
                    <span>View Stages</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDonatingCampaignId(camp.id);
                      setDonationSuccess(null);
                    }}
                    className="btn btn-primary text-xs py-2 px-3 justify-center"
                  >
                    <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Donate Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Escrow Donation Modal */}
      {donatingCampaignId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-2xl border-2 border-line bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 id="donate-modal-title" className="text-lg font-bold">
                  Escrow Protected Donation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDonatingCampaignId(null)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Your contribution will be held safely by the smart contract escrow and released in 80/20 sequential
              milestones verified by independent auditors.
            </p>

            <form onSubmit={handleDonateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-semibold focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">
                  Donation Amount (INR ₹)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`rounded border py-1.5 text-xs font-bold ${
                        donationAmount === amt
                          ? 'border-primary bg-primary text-primary-fg'
                          : 'border-line bg-bg text-muted hover:text-ink'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min={100}
                  step={100}
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-bold focus:border-primary focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-line bg-bg p-3 text-xs text-muted space-y-1">
                <span className="font-bold text-ink block">Escrow Guarantee:</span>
                <p>• 80% released immediately when 2-of-3 auditors approve proof.</p>
                <p>• 20% retained for 48h public challenge window.</p>
                <p>• If NGO stalls past milestone deadline, you can claim an instant pro-rata refund.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDonatingCampaignId(null)}
                  className="btn btn-secondary text-xs flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs flex-1">
                  Confirm Escrow Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
