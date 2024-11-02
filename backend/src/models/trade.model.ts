export interface Trade {
    id: number;
    token: string;
    buyRpc: string;
    sellRpc: string;
    buyPrice: string;
    sellPrice: string;
    amount: string;
    buyTxHash?: string;
    sellTxHash?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    profit?: string;
    gasUsed?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TradeRequest {
    token: string;
    buyRpc: string;
    sellRpc: string;
    amount: string;
}

export interface TradeResult {
    success: boolean;
    txHash?: string;
    error?: string;
}
