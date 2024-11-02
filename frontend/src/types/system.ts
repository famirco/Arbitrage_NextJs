export interface SystemStatus {
  isRunning: boolean;
  uptime: number;
  lastSync: string;
  activeRpcs: string[];
  activeTokens: string[];
  totalTrades: number;
  successfulTrades: number;
}
