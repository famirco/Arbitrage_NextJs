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

export interface TradeData extends Trade {
    // Additional fields if needed
}

export class TradeService extends EventEmitter {
    private web3Instances: Map<string, Web3> = new Map();
    private isTrading: boolean = false;

    constructor() {
        super();
        try {
            this.initializeWeb3();
            this.setupOpportunityListener();
        } catch (error) {
            logger.error('Failed to initialize TradeService:', error);
        }
    }

    private initializeWeb3(): void {
        const rpcs = configLoader.getRpcs();
        const { privateKey } = configLoader.getSettings().web3;

        rpcs.forEach(rpc => {
            try {
                const web3 = new Web3(rpc.httpUrl);
                if (privateKey) {
                    try {
                        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
                        web3.eth.accounts.wallet.add(account);
                        logger.info(`Wallet added for ${rpc.name}`);
                    } catch (error) {
                        logger.warn(`Failed to add wallet for ${rpc.name}, continuing without wallet`);
                    }
                }
                this.web3Instances.set(rpc.name, web3);
                logger.info(`Web3 instance initialized for ${rpc.name}`);
            } catch (error) {
                logger.error(`Failed to initialize Web3 for ${rpc.name}:`, error);
            }
        });

        if (this.web3Instances.size === 0) {
            logger.warn('No Web3 instances were initialized successfully');
        }
    }

    private async executeBuyTrade(
        web3: Web3,
        token: string,
        amount: string
    ): Promise<TradeResult> {
        try {
            // Get token contract and decimals
            const tokenConfig = configLoader.getTokens().find(t => t.symbol === token);
            if (!tokenConfig) {
                return { success: false, error: 'Token configuration not found' };
            }

            // Get gas price
            const gasPrice = await getGasPrice(web3);
            if (!gasPrice) {
                return { success: false, error: 'Failed to get gas price' };
            }

            // TODO: Implement actual DEX buy logic here
            // For now, return mock success
            return { 
                success: true, 
                txHash: "0x" + "0".repeat(64),
                gasUsed: "0",
                actualAmount: amount
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }

    private async executeSellTrade(
        web3: Web3,
        token: string,
        amount: string
    ): Promise<TradeResult> {
        try {
            // Get token contract and decimals
            const tokenConfig = configLoader.getTokens().find(t => t.symbol === token);
            if (!tokenConfig) {
                return { success: false, error: 'Token configuration not found' };
            }

            // Get gas price
            const gasPrice = await getGasPrice(web3);
            if (!gasPrice) {
                return { success: false, error: 'Failed to get gas price' };
            }

            // TODO: Implement actual DEX sell logic here
            // For now, return mock success
            return { 
                success: true, 
                txHash: "0x" + "1".repeat(64),
                gasUsed: "0",
                actualAmount: amount
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
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

    private setupOpportunityListener(): void {
        arbitrageService.on('opportunity', async (opportunity) => {
            const settings = configLoader.getSettings();
            const token = configLoader.getTokens()
                .find(t => t.symbol === opportunity.token);

            if (!token) {
                logger.warn(`Token configuration not found for ${opportunity.token}`);
                return;
            }

            await this.executeTrade(
                opportunity.token,
                opportunity.buyRpc,
                opportunity.sellRpc,
                token.minTradeAmount
            );
        });
    }

    public async executeTrade(
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
                    status: 'BUYING',
                    gasUsed: buyResult.gasUsed
                }
            });

            // Execute sell trade
            const sellResult = await this.executeSellTrade(
                this.web3Instances.get(sellRpc)!,
                token,
                buyResult.actualAmount || amount
            );

            if (!sellResult.success) {
                await this.updateTradeStatus(trade.id, 'FAILED', sellResult.error);
                return;
            }

            // Calculate total gas used
            const totalGasUsed = new BigNumber(buyResult.gasUsed || '0')
                .plus(sellResult.gasUsed || '0')
                .toString();

            // Update trade with final status
            await prisma.trade.update({
                where: { id: trade.id },
                data: {
                    sellTxHash: sellResult.txHash,
                    status: 'SUCCESS',
                    gasUsed: totalGasUsed
                }
            });

            // Notify via Telegram if configured
            const telegramConfig = configLoader.getSettings().telegram;
            if (telegramConfig.botToken && telegramConfig.chatId) {
                const message = `Trade completed successfully!\n` +
                    `Token: ${token}\n` +
                    `Buy: ${buyRpc}\n` +
                    `Sell: ${sellRpc}\n` +
                    `Amount: ${amount}\n` +
                    `Gas Used: ${totalGasUsed}`;
                
                await telegramService.sendMessage(message);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error executing trade:', errorMessage);
            await this.updateTradeStatus(0, 'FAILED', errorMessage);
        } finally {
            this.isTrading = false;
        }
    }

    public stop(): void {
        this.removeAllListeners();
        logger.info('Trade service stopped');
    }
}

export const tradeService = new TradeService();