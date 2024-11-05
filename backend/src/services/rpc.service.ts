import Web3 from 'web3';
import { EventEmitter } from 'events';
import { configLoader } from '../utils/config.loader';
import { RpcStatus } from '../models/status.model';
import logger from '../utils/logger';

class RpcService extends EventEmitter {
    private rpcs: Map<string, Web3> = new Map();
    private status: Map<string, RpcStatus> = new Map();
    private checkInterval: NodeJS.Timeout | null = null;
    private readonly MAX_ERROR_COUNT = 3;
    private readonly RESPONSE_TIME_THRESHOLD = 5000; // 5 seconds

    constructor() {
        super();
        this.initializeRpcs();
        this.startHealthCheck();
    }

    private initializeRpcs() {
        const rpcConfigs = configLoader.getRpcs();
        rpcConfigs.forEach(rpc => {
            try {
                const web3 = new Web3(rpc.url);
                this.rpcs.set(rpc.name, web3);
                this.status.set(rpc.name, {
                    isActive: true,
                    lastCheck: new Date(),
                    responseTime: 0,
                    errorCount: 0
                });
                logger.info(`RPC ${rpc.name} initialized`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger.error(`Failed to initialize RPC ${rpc.name}:`, errorMessage);
            }
        });
    }

    private async checkRpc(name: string, web3: Web3): Promise<void> {
        const startTime = Date.now();
        try {
            await web3.eth.getBlockNumber();
            const responseTime = Date.now() - startTime;
            
            const currentStatus = this.status.get(name);
            if (currentStatus) {
                const isActive = responseTime < this.RESPONSE_TIME_THRESHOLD;
                this.status.set(name, {
                    isActive,
                    lastCheck: new Date(),
                    responseTime,
                    errorCount: 0
                });

                this.emit('rpcStatus', {
                    name,
                    status: isActive ? 'active' : 'slow',
                    responseTime
                });
            }
        } catch (error) {
            const currentStatus = this.status.get(name);
            if (currentStatus) {
                currentStatus.errorCount++;
                currentStatus.isActive = currentStatus.errorCount < this.MAX_ERROR_COUNT;
                currentStatus.lastCheck = new Date();
                currentStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
                this.status.set(name, currentStatus);

                this.emit('rpcStatus', {
                    name,
                    status: 'error',
                    error: currentStatus.lastError
                });

                logger.error(`RPC ${name} check failed:`, currentStatus.lastError);
            }
        }
    }

    private startHealthCheck() {
        const { checkInterval } = configLoader.getSettings().trading;
        this.checkInterval = setInterval(() => {
            this.rpcs.forEach((web3, name) => {
                this.checkRpc(name, web3);
            });
        }, checkInterval * 1000);
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
        this.removeAllListeners();
        logger.info('RPC service stopped');
    }
}

export const rpcService = new RpcService();