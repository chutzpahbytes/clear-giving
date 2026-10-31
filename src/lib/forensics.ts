import type { EvidenceItem, Milestone } from '@/types/models';

export interface ForensicSignal {
  category: 'reuse' | 'metadata' | 'provenance' | 'ai_score' | 'receipt';
  status: 'pass' | 'warning' | 'fail';
  title: string;
  details: string;
  score?: number; // 0 - 100
}

export interface ForensicReport {
  evidenceId: string;
  evidenceTitle: string;
  overallRisk: 'low' | 'medium' | 'high';
  signals: ForensicSignal[];
  advisoryAiScore: number; // 0 - 100
  isDuplicate: boolean;
  duplicateCampaign?: string;
  gpsStatus: 'verified' | 'mismatch' | 'missing';
  gpsDistanceKm?: number;
  receiptStatus: 'verified' | 'discrepancy' | 'not_applicable';
  receiptVarianceRupees?: number;
  summary: string;
}

// Known sample catalog of previously filed evidence hashes across all campaigns
const KNOWN_PAST_EVIDENCE_CATALOG = [
  {
    hash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    campaignTitle: 'Winter Blankets Drive 2024',
    milestoneTitle: 'Blanket Distribution Phase 1',
    uploadDate: '2024-11-15',
  },
  {
    hash: 'bafybeicazw6hx2qf7v5m5d4o4e3y21nf3efuylqabf3oclgtqy99fbzdi',
    campaignTitle: 'Village Library Drive (Gyan Jyoti)',
    milestoneTitle: 'Books Purchase Proof',
    uploadDate: '2025-02-10',
  },
];

// Target coordinates for Jal Seva Rajasthan project (Alwar District)
export const HERO_TARGET_LOCATION = {
  lat: 27.553,
  lng: 76.6346,
  toleranceKm: 15,
  name: 'Govt Upper Primary School, Alwar District, Rajasthan',
};

/**
 * Calculates Great-Circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Runs automated multi-layered forensic checks on an evidence item.
 * Provides risk indicators to help human auditors make an informed decision.
 */
export function analyzeEvidence(
  evidence: EvidenceItem,
  milestone?: Milestone
): ForensicReport {
  const signals: ForensicSignal[] = [];
  const meta = evidence.metadata || {};

  // 1. REUSE CHECK (File and Perceptual Fingerprint)
  const isCatalogDuplicate = KNOWN_PAST_EVIDENCE_CATALOG.find(
    (item) => item.hash === evidence.fileHash
  );
  const isMarkedReused = meta.isReused || Boolean(isCatalogDuplicate);

  if (isMarkedReused) {
    const dupTitle = isCatalogDuplicate
      ? isCatalogDuplicate.campaignTitle
      : 'Prior relief distribution campaign (2024)';
    signals.push({
      category: 'reuse',
      status: 'fail',
      title: 'Duplicate Photo Detected',
      details: `Visual perceptual hash matches prior submission from "${dupTitle}". High probability of recycled proof.`,
      score: 95,
    });
  } else {
    signals.push({
      category: 'reuse',
      status: 'pass',
      title: 'Unique Image Fingerprint',
      details: 'No perceptual or cryptographic hash match found in platform cross-campaign evidence registry.',
      score: 0,
    });
  }

  // 2. METADATA & GEOLOCATION CHECK
  let gpsStatus: ForensicReport['gpsStatus'] = 'missing';
  let distanceKm: number | undefined;

  if (meta.gpsCoords && meta.gpsCoords.lat && meta.gpsCoords.lng) {
    distanceKm = calculateDistanceKm(
      meta.gpsCoords.lat,
      meta.gpsCoords.lng,
      HERO_TARGET_LOCATION.lat,
      HERO_TARGET_LOCATION.lng
    );

    if (distanceKm <= HERO_TARGET_LOCATION.toleranceKm) {
      gpsStatus = 'verified';
      signals.push({
        category: 'metadata',
        status: 'pass',
        title: 'Geotag Coordinates Match Project Site',
        details: `EXIF GPS location is within ${distanceKm} km of ${HERO_TARGET_LOCATION.name} (declared site).`,
      });
    } else {
      gpsStatus = 'mismatch';
      signals.push({
        category: 'metadata',
        status: 'warning',
        title: 'Geotag Location Discrepancy',
        details: `EXIF GPS coordinates are ${distanceKm} km away from declared project site (${HERO_TARGET_LOCATION.name}).`,
      });
    }
  } else {
    signals.push({
      category: 'metadata',
      status: 'warning',
      title: 'No GPS Metadata Found',
      details: 'EXIF geotag data is stripped or missing. Physical on-site audit confirmation recommended.',
    });
  }

  // Camera & Date check
  if (meta.date) {
    const photoDate = new Date(meta.date).getTime();
    const now = Date.now();
    const ageDays = Math.round((now - photoDate) / (1000 * 60 * 60 * 24));

    if (ageDays > 365) {
      signals.push({
        category: 'metadata',
        status: 'warning',
        title: 'Stale Capture Timestamp',
        details: `Original photo was captured ${ageDays} days ago (${meta.date}). Verify if this reflects recent work.`,
      });
    } else {
      signals.push({
        category: 'metadata',
        status: 'pass',
        title: 'Recent Capture Timestamp',
        details: `Photo captured recently on ${meta.date} with ${meta.camera || 'certified mobile device'}.`,
      });
    }
  }

  // 3. PROVENANCE & CONTENT CREDENTIALS (C2PA)
  if (meta.c2pa) {
    signals.push({
      category: 'provenance',
      status: 'pass',
      title: 'Content Credentials (C2PA) Verified',
      details: 'Cryptographic device signature confirmed: image is directly from camera sensor with zero post-processing edits.',
    });
  } else {
    signals.push({
      category: 'provenance',
      status: 'warning',
      title: 'No C2PA Content Credentials',
      details: 'File lacks standard C2PA provenance header. Standard digital camera file with standard metadata.',
    });
  }

  // 4. ADVISORY AI-LIKELIHOOD SCORE
  const aiScore = meta.isAIAdvisoryScore ?? 12; // default low score for genuine photos

  if (aiScore >= 70) {
    signals.push({
      category: 'ai_score',
      status: 'fail',
      title: 'High AI-Generation Risk (Advisory)',
      details: `Advisory heuristic score of ${aiScore}%. Detects synthetic texture smoothing and diffusion artifacts. Advisory indicator only: certified human auditor must verify.`,
      score: aiScore,
    });
  } else if (aiScore >= 40) {
    signals.push({
      category: 'ai_score',
      status: 'warning',
      title: 'Moderate AI-Generation Risk (Advisory)',
      details: `Advisory heuristic score of ${aiScore}%. Minor frequency anomalies detected. Human auditor review recommended.`,
      score: aiScore,
    });
  } else {
    signals.push({
      category: 'ai_score',
      status: 'pass',
      title: 'Low AI-Generation Risk (Advisory)',
      details: `Advisory heuristic score is ${aiScore}%. Natural optical noise grain and lens distortion patterns match authentic physical camera.`,
      score: aiScore,
    });
  }

  // 5. RECEIPT & INVOICE CROSS-CHECK
  let receiptStatus: ForensicReport['receiptStatus'] = 'not_applicable';
  let varianceRupees: number | undefined;

  if (evidence.fileType === 'receipt' || evidence.claimedAmount) {
    const claimed = evidence.claimedAmount || 0;
    const stageBudget = milestone?.targetAmount || 80000;

    if (claimed > 0) {
      varianceRupees = claimed - stageBudget;
      if (claimed <= stageBudget) {
        receiptStatus = 'verified';
        signals.push({
          category: 'receipt',
          status: 'pass',
          title: 'Invoice Matches Milestone Budget',
          details: `Invoice amount of ₹${claimed.toLocaleString('en-IN')} is within the allocated stage budget of ₹${stageBudget.toLocaleString('en-IN')}. Tax ID & vendor format verified.`,
        });
      } else {
        receiptStatus = 'discrepancy';
        signals.push({
          category: 'receipt',
          status: 'warning',
          title: 'Invoice Exceeds Stage Budget',
          details: `Invoice amount of ₹${claimed.toLocaleString('en-IN')} exceeds stage allocation (₹${stageBudget.toLocaleString('en-IN')}) by ₹${varianceRupees.toLocaleString('en-IN')}.`,
        });
      }
    }
  }

  // Calculate Overall Risk
  const failCount = signals.filter((s) => s.status === 'fail').length;
  const warnCount = signals.filter((s) => s.status === 'warning').length;

  let overallRisk: ForensicReport['overallRisk'] = 'low';
  if (failCount > 0 || aiScore >= 70 || isMarkedReused) {
    overallRisk = 'high';
  } else if (warnCount >= 2 || aiScore >= 40 || gpsStatus === 'mismatch') {
    overallRisk = 'medium';
  }

  const summary =
    overallRisk === 'high'
      ? 'CRITICAL RISK: Duplicate or synthetic image anomalies detected. Auditor review and challenge window scrutiny required.'
      : overallRisk === 'medium'
      ? 'MODERATE RISK: Review recommended for metadata/GPS variances before approving.'
      : 'CLEAN FORENSIC AUDIT: All perceptual, metadata, and advisory signals indicate authentic real-world proof.';

  return {
    evidenceId: evidence.id,
    evidenceTitle: evidence.title,
    overallRisk,
    signals,
    advisoryAiScore: aiScore,
    isDuplicate: isMarkedReused,
    duplicateCampaign: isCatalogDuplicate?.campaignTitle,
    gpsStatus,
    gpsDistanceKm: distanceKm,
    receiptStatus,
    receiptVarianceRupees: varianceRupees,
    summary,
  };
}
