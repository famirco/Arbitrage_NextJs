export interface SystemStatus {
    activeRpcs: number;
    totalRpcs: number;
    lastUpdate: Date;
    activeTokens: string[];
    walletBalance: string;
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
}

export interface RpcStatus {
    isActive: boolean;
    lastCheck: Date;
    responseTime: number;
    errorCount: number;
    lastError?: string;
}

export interface PriceStatus {
    price: string;
    timestamp: number;
    lastUpdate: Date;
    error?: string;
}
