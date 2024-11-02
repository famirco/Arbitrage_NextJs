import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

export interface RpcConfig {
    url: string;
    chainId: number;
    name: string;
    timeout: number;
}

export interface TokenConfig {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    minTradeAmount: string;
}

export interface Settings {
    trading: {
        checkInterval: number;
        walletPercentage: number;
        gasLimit: number;
        maxSlippage: number;
        minProfitPercentage: number;
    };
    telegram: {
        botToken: string;
        chatId: string;
    };
    web3: {
        privateKey: string;
        gasMultiplier: number;
    };
}

class ConfigLoader {
    private rpcs: RpcConfig[] = [];
    private tokens: TokenConfig[] = [];
    private settings: Settings = {
        trading: {
            checkInterval: 10,
            walletPercentage: 10,
            gasLimit: 300000,
            maxSlippage: 0.5,
            minProfitPercentage: 0.1
        },
        telegram: {
            botToken: '',
            chatId: ''
        },
        web3: {
            privateKey: '',
            gasMultiplier: 1.1
        }
    };
    private configPath: string;

    constructor() {
        this.configPath = path.join(process.cwd(), 'src', 'config');
        this.loadConfigs();
    }

    private loadConfigs() {
        try {
            // Load RPC config
            const rpcFile = fs.readFileSync(path.join(this.configPath, 'rpc.yaml'), 'utf8');
            this.rpcs = (yaml.load(rpcFile) as { rpcs: RpcConfig[] }).rpcs;

            // Load tokens config
            const tokenFile = fs.readFileSync(path.join(this.configPath, 'tokens.yaml'), 'utf8');
            this.tokens = (yaml.load(tokenFile) as { tokens: TokenConfig[] }).tokens;

            // Load settings
            const settingsFile = fs.readFileSync(path.join(this.configPath, 'settings.yaml'), 'utf8');
            this.settings = yaml.load(settingsFile) as Settings;

            logger.info('Configs loaded successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error loading configs:', errorMessage);
            
            // Don't exit if we're in development mode
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            }
        }
    }

    public getRpcs(): RpcConfig[] {
        return this.rpcs;
    }

    public getTokens(): TokenConfig[] {
        return this.tokens;
    }

    public getSettings(): Settings {
        return this.settings;
    }
}

export const configLoader = new ConfigLoader();