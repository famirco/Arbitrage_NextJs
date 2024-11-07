import Web3 from 'web3';
import { WebsocketProvider } from 'web3-core';
import { EventEmitter } from 'events';
import { configLoader } from '../utils/config.loader';
import { RpcStatus } from '../models/status.model';
import logger from '../utils/logger';

class RpcService extends EventEmitter {
    private rpcs: Map<string, Web3> = new Map();
    private providers: Map<string, WebsocketProvider> = new Map();
    private status: Map<string, RpcStatus> = new Map();
    private checkInterval: NodeJS.Timeout | null = null;
    private readonly MAX_ERROR_COUNT = 3;
    private readonly RESPONSE_TIME_THRESHOLD = 5000; // 5 seconds
    private readonly RECONNECT_DELAY = 5000;

    constructor() {
        super();
        this.initializeRpcs();
        this.startHealthCheck();
    }

    private async initializeRpcs() {
        const rpcConfigs = configLoader.getRpcs();
        for (const rpc of rpcConfigs) {
            await this.connectRpc(rpc);
        }
    }

    private async connectRpc(rpc: any) {
        try {
            const wsUrl = this.getWebSocketUrl(rpc.url);
            const provider = new Web3.providers.WebsocketProvider(wsUrl, {
                timeout: rpc.timeout || 5000,
                reconnect: {
                    auto: true,
                    delay: this.RECONNECT_DELAY,
                    maxAttempts: 5,
                    onTimeout: false
                }
            });

            const web3 = new Web3(provider);

            provider.on('connect', () => {
                logger.info(`WebSocket connected to RPC: ${rpc.name}`);
                this.setupBlockSubscription(rpc.name, web3);
                this.updateStatus(rpc.name, true);
            });

            provider.on('error', (error) => {
                logger.error(`WebSocket error for RPC ${rpc.name}:`, error);
                this.handleConnectionError(rpc.name);
            });

            provider.on('end', () => {
                logger.warn(`WebSocket connection ended for RPC ${rpc.name}`);
                this.handleConnectionError(rpc.name);
                setTimeout(() => this.connectRpc(rpc), this.RECONNECT_DELAY);
            });

            this.rpcs.set(rpc.name, web3);
            this.providers.set(rpc.name, provider);
            this.status.set(rpc.name, {
                isActive: true,
                lastCheck: new Date(),
                responseTime: 0,
                errorCount: 0
            });

            logger.info(`RPC ${rpc.name} initialized with WebSocket`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to initialize RPC ${rpc.name}:`, errorMessage);
            this.handleConnectionError(rpc.name);
            setTimeout(() => this.connectRpc(rpc), this.RECONNECT_DELAY);
        }
    }

    private setupBlockSubscription(rpcName: string, web3: Web3) {
        web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
            if (error) {
                logger.error(`Block subscription error for ${rpcName}:`, error);
                return;
            }

            // Update last successful response time
            const currentStatus = this.status.get(rpcName);
            if (currentStatus) {
                currentStatus.lastCheck = new Date();
                currentStatus.responseTime = 0; // Reset response time on successful block
                this.status.set(rpcName, currentStatus);
            }

            this.emit('newBlock', {
                rpc: rpcName,
                blockNumber: blockHeader.number,
                timestamp: new Date()
            });
        });
    }

    private handleConnectionError(rpcName: string) {
        const currentStatus = this.status.get(rpcName);
        if (currentStatus) {
            currentStatus.errorCount++;
            currentStatus.isActive = currentStatus.errorCount < this.MAX_ERROR_COUNT;
            currentStatus.lastCheck = new Date();
            this.status.set(rpcName, currentStatus);

            this.emit('rpcStatus', {
                name: rpcName,
                status: 'error',
                errorCount: currentStatus.errorCount
            });
        }
    }

    private updateStatus(rpcName: string, isActive: boolean) {
        const currentStatus = this.status.get(rpcName);
        if (currentStatus) {
            currentStatus.isActive = isActive;
            currentStatus.lastCheck = new Date();
            currentStatus.errorCount = isActive ? 0 : currentStatus.errorCount;
            this.status.set(rpcName, currentStatus);

            this.emit('rpcStatus', {
                name: rpcName,
                status: isActive ? 'active' : 'error'
            });
        }
    }

    private startHealthCheck() {
        const { checkInterval } = configLoader.getSettings().trading;
        this.checkInterval = setInterval(async () => {
            for (const [name, web3] of this.rpcs) {
                try {
                    const startTime = Date.now();
                    await web3.eth.net.isListening();
                    const responseTime = Date.now() - startTime;
                    
                    const currentStatus = this.status.get(name);
                    if (currentStatus) {
                        currentStatus.responseTime = responseTime;
                        currentStatus.isActive = responseTime < this.RESPONSE_TIME_THRESHOLD;
                        currentStatus.lastCheck = new Date();
                        this.status.set(name, currentStatus);
                    }
                } catch (error) {
                    this.handleConnectionError(name);
                }
            }
        }, checkInterval * 1000);
    }

    private getWebSocketUrl(httpUrl: string): string {
        return httpUrl
            .replace('https://', 'wss://')
            .replace('http://', 'ws://');
    }

    public getWeb3(rpcName: string): Web3 | undefined {
        return this.rpcs.get(rpcName);
    }

    public getActiveRpcs(): Map<string, Web3> {
        const activeRpcs = new Map<string, Web3>();
        this.rpcs.forEach((web3, name) => {
            if (this.status.get(name)?.isActive) {
                activeRpcs.set(name, web3);
            }
        });
        return activeRpcs;
    }

    public getRpcStatus(): Map<string, RpcStatus> {
        return this.status;
    }

    public stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        // Close all WebSocket connections
        this.providers.forEach((provider, name) => {
            try {
                provider.disconnect();
                logger.info(`WebSocket disconnected for RPC: ${name}`);
            } catch (error) {
                logger.error(`Error disconnecting WebSocket for RPC ${name}:`, error);
            }
        });

        this.removeAllListeners();
        logger.info('RPC service stopped');
    }
}

export const rpcService = new RpcService();