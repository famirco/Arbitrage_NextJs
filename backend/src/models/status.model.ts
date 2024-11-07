export interface RpcStatus {
    isActive: boolean;
    lastCheck: Date;
    responseTime: number;
    errorCount: number;
    lastError?: string;
    lastBlockNumber?: number;
}

export interface TradeStatus {
    timestamp: Date;
    buyAmount: number;
    buyPrice: number;
    buyRPC: string;
    sellAmount: number;
    sellPrice: number;
    sellRPC: string;
    status: 'SUCCESS' | 'FAILED';
    buyTxHash: string;
    sellTxHash: string;
    profit: number;
}

export interface PriceStatus {
    timestamp: Date;
    token: string;
    prices: {
        [rpcName: string]: {
            price: number;
            lastUpdate: Date;
        };
    };
}
