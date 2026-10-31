/**
 * Simulated IPFS utilities for proof storage and hash generation.
 */

// Simple deterministic hash simulation for demo
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function generateSimulatedCid(content: string): string {
  const hash = simpleHash(content + Date.now().toString());
  return `bafybei${hash}7xqf3kmopw92j${hash.slice(0, 4)}e`;
}

export function generateTxHash(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `0x${time}${rand}${simpleHash(time + rand).repeat(3)}`.slice(0, 66);
}

export function getIpfsGatewayUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}
