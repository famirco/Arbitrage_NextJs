import { EventEmitter } from 'events';
import { priceService } from './price.service';
import { configLoader } from '../utils/config.loader';
import BigNumber from 'bignumber.js';
import logger from '../utils/logger';

interface ArbitrageOpportunity {
    token: string;
    buyRpc: string;
    sellRpc: string;
    buyPrice: string;
    sellPrice: string;
    profit: string;
    profitPercentage: string;
    timestamp: number;
}

class ArbitrageService extends EventEmitter {
    private checkInterval: NodeJS.Timeout;

    constructor() {
        super();
        this.startOpportunityCheck();
    }

    private calculateProfit(buyPrice: string, sellPrice: string, amount: string): BigNumber {
        const buy = new BigNumber(buyPrice);
        const sell = new BigNumber(sellPrice);
        const qty = new BigNumber(amount);
        
        return sell.minus(buy).multipliedBy(qty);
    }

    private async findOpportunities() {
        const tokens = configLoader.getTokens();
        const { minProfitPercentage } = configLoader.getSettings().trading;

        for (const token of tokens) {
            const prices = priceService.getPrices(token.symbol);
            if (!prices || prices.size < 2) continue;

            const priceArray = Array.from(prices.entries());
            
            for (let i = 0; i < priceArray.length; i++) {
                for (let j = i + 1; j < priceArray.length; j++) {
                    const [buyRpc, buyData] = priceArray[i];
                    const [sellRpc, sellData] = priceArray[j];

                    const profit = this.calculateProfit(
                        buyData.price,
                        sellData.price,
                        token.minTradeAmount
                    );

                    const profitPercentage = profit
                        .dividedBy(new BigNumber(buyData.price))
                        .multipliedBy(100);

                    if (profitPercentage.isGreaterThan(minProfitPercentage)) {
                        const opportunity: ArbitrageOpportunity = {
                            token: token.symbol,
                            buyRpc,
                            sellRpc,
                            buyPrice: buyData.price,
                            sellPrice: sellData.price,
                            profit: profit.toString(),
                            profitPercentage: profitPercentage.toString(),
                            timestamp: Date.now()
                        };

                        this.emit('opportunity', opportunity);
                        logger.info('Arbitrage opportunity found:', opportunity);
                    }
                }
            }
        }
    }

    private startOpportunityCheck() {
        const { checkInterval } = configLoader.getSettings().trading;
        this.checkInterval = setInterval(() => {
            this.findOpportunities().catch(error => {
                logger.error('Error finding opportunities:', error);
            });
        }, checkInterval * 1000);
    }

    public stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.removeAllListeners();
        logger.info('Arbitrage service stopped');
    }
}

export const arbitrageService = new ArbitrageService();
