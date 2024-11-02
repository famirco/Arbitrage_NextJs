import Web3 from 'web3';
import { EventEmitter } from 'events';
import { configLoader } from '../utils/config.loader';
import { rpcService } from './rpc.service';
import { arbitrageService } from './arbitrage.service';
import { telegramService } from './telegram.service';
import { PrismaClient } from '@prisma/client';
import { Trade, TradeResult } from '../models/trade.model';
import BigNumber from 'bignumber.js';
import logger from '../utils/logger';
import { getGasPrice, estimateGas } from '../utils/web3.utils';

const prisma = new PrismaClient();

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
    ): Promise<TradeResult> {
        if (this.isTrading) {
            return { success: false, error: 'Another trade is in progress' };
        }

        this.isTrading = true;
        let trade: Trade | null = null;

        try {
            trade = await prisma.trade.create({
                data: {
                    token,
                    buyRpc,
                    sellRpc,
                    amount,
                    status: 'PENDING',
                    buyPrice: '0',
                    sellPrice: '0'
                }
            });

            // Execute buy trade
            const buyResult = await this.executeBuyTrade(
                this.web3Instances.get(buyRpc)!,
                token,
                amount
            );

            if (!buyResult.success) {
                throw new Error(`Buy failed: ${buyResult.error}`);
            }

            // Execute sell trade
            const sellResult = await this.executeSellTrade(
                this.web3Instances.get(sellRpc)!,
                token,
                amount
            );

            if (!sellResult.success) {
                throw new Error(`Sell failed: ${sellResult.error}`);
            }

            // Update trade record
            await prisma.trade.update({
                where: { id: trade.id },
                data: {
                    status: 'SUCCESS',
                    buyTxHash: buyResult.txHash,
                    sellTxHash: sellResult.txHash
                }
            });

            // Send notification
            await telegramService.sendMessage(
                `Trade successful!\nToken: ${token}\nProfit: ${trade.profit}`
            );

            return { success: true, txHash: sellResult.txHash };

        } catch (error) {
            logger.error('Trade execution failed:', error);

            if (trade) {
                await prisma.trade.update({
                    where: { id: trade.id },
                    data: {
                        status: 'FAILED',
                        error: error.message
                    }
                });
            }

            await telegramService.sendMessage(
                `Trade failed!\nToken: ${token}\nError: ${error.message}`
            );

            return { success: false, error: error.message };
        } finally {
            this.isTrading = false;
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
