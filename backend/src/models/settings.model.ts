export interface Settings {
    trading: {
        checkInterval: number;
        minProfit: number;
        maxSlippage: number;
        gasLimit: number;
        tradeAmount: number;
    };
    monitoring: {
        priceUpdateInterval: number;
        healthCheckInterval: number;
    };
}
