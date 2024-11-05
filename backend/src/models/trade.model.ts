export interface TradeResult {
    success: boolean;
    error?: string;
    txHash?: string;
    gasUsed?: string;
    actualAmount?: string;
}

export interface Trade {
    id: number;
    status: string;
    token: string;
    buyRpc: string;
    sellRpc: string;
    buyPrice: string;
    sellPrice: string;
    amount: string;
    buyTxHash: string | null;
    sellTxHash: string | null;
    profit: string | null;
    gasUsed: string | null;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
}