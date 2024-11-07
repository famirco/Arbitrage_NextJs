export interface RPCConfig {
    name: string;
    httpUrl: string;
    wsUrl: string;
    chainId: number;
    timeout: number;
    maxReconnectAttempts: number;
    reconnectDelay: number;
    healthCheckInterval: number;
}

export interface RPCStatus {
    isActive: boolean;
    lastCheck: Date;
    responseTime: number;
    errorCount: number;
    lastError?: string;
    lastBlockNumber?: number;
}

export interface RPCStatusEvent {
    name: string;
    status: 'active' | 'error' | 'slow';
    errorCount?: number;
    responseTime?: number;
    error?: string;
}

export interface BlockEvent {
    rpc: string;
    blockNumber: number;
    timestamp: Date;
}