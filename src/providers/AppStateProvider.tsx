'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  Auditor,
  Campaign,
  ChecklistAnswer,
  Dispute,
  Donation,
  EvidenceMetadata,
  NGO,
} from '@/types/models';
import { platformService } from '@/lib/services';

interface AppStateContextValue {
  state: AppState;
  heroCampaign: Campaign | undefined;
  getCampaign: (id: string) => Campaign | undefined;
  getNgo: (id: string) => NGO | undefined;
  getAuditor: (id: string) => Auditor | undefined;
  totalRaised: number;
  totalHeld: number;
  totalReleased: number;
  totalRetained: number;
  isChainMode: boolean;
  toggleChainMode: () => void;
  actions: {
    loadSampleData: () => void;
    resetState: () => void;
    donate: (
      campaignId: string,
      amount: number,
      donorName: string,
      donorAddress?: string
    ) => Donation;
    submitProof: (
      campaignId: string,
      milestoneId: string,
      proof: {
        title: string;
        description: string;
        fileUrl: string;
        fileType: 'image' | 'pdf' | 'receipt';
        claimedAmount?: number;
        metadata?: EvidenceMetadata;
        isCanary?: boolean;
      }
    ) => void;
    castVote: (
      campaignId: string,
      milestoneId: string,
      auditorId: string,
      decision: 'approve' | 'reject',
      reviewData: {
        reviewSeconds: number;
        openedAllEvidence: boolean;
        checklistAnswers: ChecklistAnswer[];
        comments?: string;
      }
    ) => { outcome: string; immediatePayout?: number; retainedAmount?: number };
    fileDispute: (
      campaignId: string,
      milestoneId: string,
      filedBy: string,
      reason: string,
      evidence: string
    ) => Dispute;
    resolveDispute: (disputeId: string, upheld: boolean, notes?: string) => void;
    fastForwardTime: (hours: number) => { message: string; releasedRetentions: number };
    claimRefund: (campaignId: string, donorName: string) => number;
    approvePlan: (campaignId: string, auditorId: string) => void;
    injectCanaryProof: (
      campaignId: string,
      milestoneId: string,
      canaryTitle?: string
    ) => void;
  };
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => platformService.getState());
  const [isChainMode, setIsChainMode] = useState<boolean>(false);

  const toggleChainMode = () => {
    setIsChainMode((prev) => !prev);
  };

  useEffect(() => {
    const unsubscribe = platformService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  const heroCampaign = useMemo(() => {
    return state.campaigns.find((c) => c.id === 'camp-hero') || state.campaigns[0];
  }, [state.campaigns]);

  const totalRaised = useMemo(() => {
    return state.campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  }, [state.campaigns]);

  const totalHeld = useMemo(() => {
    return state.campaigns.reduce((sum, c) => sum + c.heldAmount, 0);
  }, [state.campaigns]);

  const totalReleased = useMemo(() => {
    return state.campaigns.reduce((sum, c) => sum + c.releasedAmount, 0);
  }, [state.campaigns]);

  const totalRetained = useMemo(() => {
    return state.campaigns.reduce((sum, c) => sum + c.retainedAmount, 0);
  }, [state.campaigns]);

  const getCampaign = (id: string) => state.campaigns.find((c) => c.id === id);
  const getNgo = (id: string) => state.ngos.find((n) => n.id === id);
  const getAuditor = (id: string) => state.auditors.find((a) => a.id === id);

  const actions = useMemo(() => {
    return {
      loadSampleData: () => {
        platformService.loadSampleData();
      },
      resetState: () => {
        platformService.resetState();
      },
      donate: (
        campaignId: string,
        amount: number,
        donorName: string,
        donorAddress?: string
      ) => {
        const res = platformService.donate(campaignId, amount, donorName, donorAddress);
        return res.donation;
      },
      submitProof: (
        campaignId: string,
        milestoneId: string,
        proof: {
          title: string;
          description: string;
          fileUrl: string;
          fileType: 'image' | 'pdf' | 'receipt';
          claimedAmount?: number;
          metadata?: EvidenceMetadata;
          isCanary?: boolean;
        }
      ) => {
        platformService.submitProof(campaignId, milestoneId, proof);
      },
      castVote: (
        campaignId: string,
        milestoneId: string,
        auditorId: string,
        decision: 'approve' | 'reject',
        reviewData: {
          reviewSeconds: number;
          openedAllEvidence: boolean;
          checklistAnswers: ChecklistAnswer[];
          comments?: string;
        }
      ) => {
        const res = platformService.castVote(
          campaignId,
          milestoneId,
          auditorId,
          decision,
          reviewData
        );
        return {
          outcome: res.outcome,
          immediatePayout: res.immediatePayout,
          retainedAmount: res.retainedAmount,
        };
      },
      fileDispute: (
        campaignId: string,
        milestoneId: string,
        filedBy: string,
        reason: string,
        evidence: string
      ) => {
        const res = platformService.fileDispute(
          campaignId,
          milestoneId,
          filedBy,
          reason,
          evidence
        );
        return res.dispute;
      },
      resolveDispute: (disputeId: string, upheld: boolean, notes?: string) => {
        platformService.resolveDispute(disputeId, upheld, notes);
      },
      fastForwardTime: (hours: number) => {
        const res = platformService.fastForwardTime(hours);
        return { message: res.message, releasedRetentions: res.releasedRetentions };
      },
      claimRefund: (campaignId: string, donorName: string) => {
        const res = platformService.claimRefund(campaignId, donorName);
        return res.refundAmount;
      },
      approvePlan: (campaignId: string, auditorId: string) => {
        platformService.approvePlan(campaignId, auditorId);
      },
      injectCanaryProof: (campaignId: string, milestoneId: string, canaryTitle?: string) => {
        platformService.injectCanaryProof(campaignId, milestoneId, canaryTitle);
      },
    };
  }, []);

  const value = useMemo(
    () => ({
      state,
      heroCampaign,
      getCampaign,
      getNgo,
      getAuditor,
      totalRaised,
      totalHeld,
      totalReleased,
      totalRetained,
      isChainMode,
      toggleChainMode,
      actions,
    }),
    [state, heroCampaign, totalRaised, totalHeld, totalReleased, totalRetained, isChainMode, actions]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
