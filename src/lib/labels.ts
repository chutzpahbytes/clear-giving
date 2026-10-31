/**
 * One place for every user-facing Web3 term.
 * "plain"     = what everyday users see (default)
 * "technical" = the real term, shown when "Technical terms" is switched on
 */
export const LABELS = {
  wallet: { plain: 'My account', technical: 'Crypto wallet' },
  connectWallet: { plain: 'Sign in securely', technical: 'Connect wallet' },
  escrow: { plain: 'Protected fund', technical: 'Smart-contract escrow' },
  fundsLocked: { plain: 'Held safely until proof is checked', technical: 'Locked in escrow' },
  transaction: { plain: 'Receipt', technical: 'Transaction' },
  transactionId: { plain: 'Receipt number', technical: 'Transaction hash' },
  proofFile: { plain: 'Proof document', technical: 'IPFS file' },
  proofId: { plain: 'Proof ID', technical: 'IPFS CID' },
  publicRecord: { plain: 'Public record', technical: 'Blockchain' },
  networkFee: { plain: 'Processing fee', technical: 'Gas fee' },
  milestone: { plain: 'Stage', technical: 'Milestone' },
  approveProof: { plain: 'Confirm this proof', technical: 'Approve milestone proof' },
  auditorVote: { plain: 'Auditor vote', technical: 'On-chain auditor vote' },
  release: { plain: 'Pay out to the charity', technical: 'Release funds' },
  demoMode: { plain: 'Practice mode (no real money)', technical: 'Demo mode (simulated chain)' },
  liveMode: { plain: 'Live public record mode', technical: 'Live chain mode (Polygon Amoy testnet)' },
} as const satisfies Record<string, { plain: string; technical: string }>;

export type LabelKey = keyof typeof LABELS;