export * from './types';
export * from './simulatorService';

import { simulatorService } from './simulatorService';
import type { IPlatformService } from './types';

// Default platform service is the simulator engine.
// In the chain phase, this factory can switch between simulator and Polygon Amoy testnet.
export const platformService: IPlatformService = simulatorService;
