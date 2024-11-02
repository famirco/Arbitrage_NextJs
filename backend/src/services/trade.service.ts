import Web3 from 'web3';
import { EventEmitter } from 'events';
import { configLoader } from '../utils/config.loader';
import { rpcService } from './rpc.service';
import { arbitrageService } from './arbitrage.service';
import { telegramService } from './telegram.service';
import { PrismaClient, Trade as PrismaTrade } from '@prisma/client';
import { TradeResult } from '../models/trade.model';
import BigNumber from 'bignumber.js';
import logger from '../utils/logger';
import { getGasPrice, estimateGas } from '../utils/web3.utils';

const prisma = new PrismaClient();

interface TradeData extends PrismaTrade {
    buyTxHash: string | null;
    sellTxHash: string | null;
    profit: string | null;
    gasUsed: string | null;
    error: string | null;
}

class TradeService extends EventEmitter {
    private web3Instances: Map<string, Web3> = new Map();
    private isTrading: boolean = false;

    constructor() {
        super();
        this.initializeWeb3();
        this.listenToOpportunities();
    }

    private initializeWeb3() {
        const rpcs = configLoader.getRpcs();
        const { privateKey } = configLoader.getSettings().web3;

        rpcs.forEach(rpc => {
            const web3 = new Web3(rpc.url);
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(account);
            this.web3Instances.set(rpc.name, web3);
        });
    }

    private async executeTrade(
        token: string,
        buyRpc: string,
        sellRpc: string,
        amount: string
    ): Promise<void> {
        if (this.isTrading) {
            logger.warn('Trade already in progress, skipping...');
            return;
        }

        this.isTrading = true;

        try {
            const trade = await prisma.trade.create({
                data: {
                    status: 'PENDING',
                    token,
                    buyRpc,
                    sellRpc,
                    buyPrice: '0',
                    sellPrice: '0',
                    amount,
                    buyTxHash: null,
                    sellTxHash: null,
                    profit: null,
                    gasUsed: null,
                    error: null
                }
            });

            // Execute buy trade
            const buyResult = await this.executeBuyTrade(
                this.web3Instances.get(buyRpc)!,
                token,
                amount
            );

            if (!buyResult.success) {
                await this.updateTradeStatus(trade.id, 'FAILED', buyResult.error);
                return;
            }

            // Update trade with buy transaction
            await prisma.trade.update({
                where: { id: trade.id },
                data: {
                    buyTxHash: buyResult.txHash,
                    status: 'BUYING'
                }
            });

            // Execute sell trade
            const sellResult = await this.executeSellTrade(
                this.web3Instances.get(sellRpc)!,
                token,
                amount
            );

            if (!sellResult.success) {
                await this.updateTradeStatus(trade.id, 'FAILED', sellResult.error);
                return;
            }

            // Update trade with sell transaction and mark as success
            await this.updateTradeStatus(trade.id, 'SUCCESS');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error executing trade:', errorMessage);
            await this.updateTradeStatus(0, 'FAILED', errorMessage);
        } finally {
            this.isTrading = false;
        }
    }

    private async updateTradeStatus(
        tradeId: number,
        status: string,
        error?: string
    ): Promise<void> {
        try {
            await prisma.trade.update({
                where: { id: tradeId },
                data: { status, error: error || null }
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error updating trade status:', errorMessage);
        }
    }

    private async executeBuyTrade(
        web3: Web3,
        token: string,
        amount: string
    ): Promise<TradeResult> {
        // TODO: Implement actual DEX buy logic
        return { success: true, txHash: "0x..." };
    }

    private async executeSellTrade(
        web3: Web3,
        token: string,
        amount: string
    ): Promise<TradeResult> {
        // TODO: Implement actual DEX sell logic
        return { success: true, txHash: "0x..." };
    }

    private listenToOpportunities() {
        arbitrageService.on('opportunity', async (opportunity) => {
            const settings = configLoader.getSettings();
            const token = configLoader.getTokens()
                .find(t => t.symbol === opportunity.token);

            if (!token) return;

            await this.executeTrade(
                opportunity.token,
                opportunity.buyRpc,
                opportunity.sellRpc,
                token.minTradeAmount
            );
        });
    }

    public stop() {
        this.removeAllListeners();
        logger.info('Trade service stopped');
    }
}

export const tradeService = new TradeService();