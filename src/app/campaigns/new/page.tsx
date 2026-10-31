'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Droplets,
  GraduationCap,
  HeartPulse,
  Layers,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useAppState } from '@/providers/AppStateProvider';
import { RolePowersCard } from '@/components/RolePowersCard';
import type { CampaignCategory } from '@/types/models';

interface StageDraft {
  title: string;
  targetAmount: number;
  description: string;
  requiredEvidence: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { state } = useAppState();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CampaignCategory>('water');
  const [goalAmount, setGoalAmount] = useState<number>(300000);
  const [deadline, setDeadline] = useState('2026-12-31');
  const [stages, setStages] = useState<StageDraft[]>([
    {
      title: 'Site Survey & Deep Borewell Drilling',
      targetAmount: 100000,
      description: 'Geological water table mapping and drilling to 250ft.',
      requiredEvidence: 'Rig GPS coordinates, hydrogeology survey report, contractor invoice.',
    },
    {
      title: 'Solar Submersible Pump & Pipe Installation',
      targetAmount: 120000,
      description: 'Installation of 5HP solar pump with stainless steel casing.',
      requiredEvidence: 'On-site geotagged photo, pump serial number certificate, vendor GST receipt.',
    },
    {
      title: 'Water Potability Testing & Village Taps',
      targetAmount: 80000,
      description: 'Lab chemical & biological potability test and distribution taps.',
      requiredEvidence: 'Certified State Lab potability clearance (IS 10500 standard), tap handover photos.',
    },
  ]);

  // "Fill with Example" 20-second demo helper (Founder request!)
  const handleFillExample = () => {
    setTitle('Solar Borewells for Tribal Schools (Banswara)');
    setDescription(
      'Providing reliable solar-powered drinking water infrastructure to 3 remote tribal schools in Banswara district, Rajasthan. Directly serving over 650 students with clean water.'
    );
    setCategory('water');
    setGoalAmount(300000);
    setDeadline('2026-12-15');
    setStages([
      {
        title: 'Stage 1: Hydrogeological Survey & Drilling',
        targetAmount: 100000,
        description: 'Complete water aquifer depth survey and drill to 220ft.',
        requiredEvidence: 'GPS geotagged rig photo, geological water strata log, contractor tax invoice.',
      },
      {
        title: 'Stage 2: Solar Pump & Inverter Installation',
        targetAmount: 120000,
        description: 'Mount 3.5HP solar panels and stainless steel submersible pump.',
        requiredEvidence: 'Photo with school principal, solar serial number match, vendor receipt.',
      },
      {
        title: 'Stage 3: Water Quality Testing & Filtration Taps',
        targetAmount: 80000,
        description: 'Independent water potability testing and stainless steel tap connections.',
        requiredEvidence: 'State Public Health Lab test (IS 10500 clearance), final handover video.',
      },
    ]);
  };

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        title: `Stage ${stages.length + 1}: Implementation`,
        targetAmount: 50000,
        description: 'Execution of work according to verified blueprint.',
        requiredEvidence: 'Geotagged photos, contractor invoices, independent test results.',
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) return;
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, field: keyof StageDraft, val: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: val };
    setStages(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sum of stages
    const stagesTotal = stages.reduce((s, st) => s + Number(st.targetAmount), 0);
    if (stagesTotal !== Number(goalAmount)) {
      alert(`The sum of stages (₹${stagesTotal.toLocaleString('en-IN')}) must equal the total campaign goal (₹${goalAmount.toLocaleString('en-IN')}).`);
      return;
    }

    alert('Campaign created and submitted for Auditor Panel plan review! In Clear Giving, auditors approve the milestone evidence blueprint before donors can contribute.');
    router.push('/ngo');
  };

  return (
    <div className="space-y-8 pb-12">
      <RolePowersCard roleOverride="ngo" />

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/ngo" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to NGO Portal</span>
        </Link>

        {/* 20-Second Demo Fill Button */}
        <button
          type="button"
          onClick={handleFillExample}
          className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-primary text-primary"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="font-bold">Fill with Example (20s Demo)</span>
        </button>
      </div>

      <section aria-labelledby="create-title" className="space-y-2">
        <h1 id="create-title" className="text-3xl font-bold">
          Propose Campaign &amp; Milestone Stages
        </h1>
        <p className="text-muted text-sm max-w-3xl">
          In Clear Giving, charities propose milestones with required evidence. Independent auditors review and
          lock the plan before launch. Once launched, milestone budgets cannot be altered.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-4">
          <h2 className="text-lg font-bold text-ink">1. Basic Campaign Information</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Campaign Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solar Borewells for Village Schools"
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CampaignCategory)}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-semibold focus:border-primary focus:outline-none"
              >
                <option value="water">Clean Water Infrastructure</option>
                <option value="education">Rural Education &amp; Schools</option>
                <option value="health">Emergency Medical &amp; Health</option>
                <option value="relief">Disaster Relief Supplies</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">Public Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the community need, geographic beneficiaries, and measurable targets..."
              className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm leading-relaxed focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Total Target Goal (INR ₹)</label>
              <input
                type="number"
                required
                min={10000}
                step={5000}
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Project Completion Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border-2 border-line bg-bg p-2 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Milestone Stage Builder */}
        <div className="rounded-xl border-2 border-line bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-ink">2. Sequential Milestone Stages</h2>
              <p className="text-xs text-muted">
                Each stage unlocks only after independent auditors inspect required evidence. Sum must equal goal (₹{goalAmount.toLocaleString('en-IN')}).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddStage}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Stage</span>
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {stages.map((st, idx) => (
              <div
                key={idx}
                className="rounded-lg border-2 border-line/60 bg-bg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">Stage {idx + 1}</span>
                  {stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(idx)}
                      className="text-danger hover:opacity-80 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted block mb-1">Stage Title</label>
                    <input
                      type="text"
                      required
                      value={st.title}
                      onChange={(e) => handleStageChange(idx, 'title', e.target.value)}
                      className="w-full rounded border border-line bg-surface p-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Budget Allocation (₹)</label>
                    <input
                      type="number"
                      required
                      value={st.targetAmount}
                      onChange={(e) => handleStageChange(idx, 'targetAmount', Number(e.target.value))}
                      className="w-full rounded border border-line bg-surface p-1.5 text-xs font-bold focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Required Evidence Checklist</label>
                  <input
                    type="text"
                    required
                    value={st.requiredEvidence}
                    onChange={(e) => handleStageChange(idx, 'requiredEvidence', e.target.value)}
                    placeholder="e.g. Geotagged photo, lab water test, itemized invoice"
                    className="w-full rounded border border-line bg-surface p-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/ngo" className="btn btn-secondary text-sm">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary text-sm px-6">
            Submit Plan for Auditor Review
          </button>
        </div>
      </form>
    </div>
  );
}
