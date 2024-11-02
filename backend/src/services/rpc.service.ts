import { EventEmitter } from 'events';
import Web3 from 'web3';
import { rpcService } from './rpc.service';
import { configLoader } from '../utils/config.loader';
import { PriceStatus } from '../models/status.model';
import logger from '../utils/logger';
import { AbiItem } from 'web3-utils';

const ERC20_ABI: AbiItem[] = [
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
];

class PriceService extends EventEmitter {
    private prices: Map<string, Map<string, PriceStatus>> = new Map();
    private updateInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.startPriceUpdates();
    }

    private async getTokenPrice(web3: Web3, tokenAddress: string, rpcName: string): Promise<PriceStatus | null> {
        try {
            const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
            // TODO: Implement actual price fetching logic
            // This is a placeholder - you'll need to implement DEX interaction
            const price = "0";

            return {
                price,
                timestamp: Date.now(),
                lastUpdate: new Date()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Error fetching price for ${tokenAddress} on ${rpcName}:`, errorMessage);
            return null;
        }
    }

    private async updatePrices() {
        const activeRpcs = rpcService.getActiveRpcs();
        const tokens = configLoader.getTokens();

        for (const token of tokens) {
            const tokenPrices = new Map<string, PriceStatus>();

            for (const [rpcName, web3] of activeRpcs.entries()) {
                const price = await this.getTokenPrice(web3, token.address, rpcName);
                if (price) {
                    tokenPrices.set(rpcName, price);
                }
            }

            this.prices.set(token.symbol, tokenPrices);
            this.emit('priceUpdate', {
                token: token.symbol,
                prices: Array.from(tokenPrices.entries())
            });
        }
    }

    private startPriceUpdates() {
        const { checkInterval } = configLoader.getSettings().trading;
        this.updateInterval = setInterval(() => {
            this.updatePrices().catch(error => {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger.error('Error updating prices:', errorMessage);
            });
        }, checkInterval * 1000);
    }

    public getPrices(symbol: string): Map<string, PriceStatus> | undefined {
        return this.prices.get(symbol);
    }

    public getAllPrices(): Map<string, Map<string, PriceStatus>> {
        return this.prices;
    }

    public stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.removeAllListeners();
        logger.info('Price service stopped');
    }
}

export const priceService = new PriceService();