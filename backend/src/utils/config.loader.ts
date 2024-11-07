import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { watch } from 'fs/promises';
import { EventEmitter } from 'events';
import logger from './logger';

interface RPCConfig {
    name: string;
    httpUrl: string;
    wsUrl: string;
    chainId: number;
    timeout: number;
    maxReconnectAttempts: number;
    reconnectDelay: number;
    healthCheckInterval: number;
}

interface GlobalSettings {
    defaultTimeout: number;
    maxResponseTime: number;
    maxErrorCount: number;
    blockSubscription: boolean;
}

interface RPCYamlConfig {
    rpcs: RPCConfig[];
    settings: GlobalSettings;
}

class ConfigLoader extends EventEmitter {
    private configDir: string;
    private configs: Map<string, any> = new Map();
    private watchers: Map<string, fs.FSWatcher> = new Map();

    constructor() {
        super();
        this.configDir = path.join(__dirname, '../config');
        this.initializeWatchers();
    }

    private async initializeWatchers() {
        try {
            // Load initial configurations
            this.loadAllConfigs();

            // Watch for file changes
            const files = ['rpc.yaml', 'tokens.yaml', 'settings.yaml'];
            for (const file of files) {
                const filePath = path.join(this.configDir, file);
                
                const watcher = fs.watch(filePath, (eventType) => {
                    if (eventType === 'change') {
                        logger.info(`Config file changed: ${file}`);
                        this.loadConfig(file);
                        this.emit('configChanged', file);
                    }
                });

                this.watchers.set(file, watcher);
            }
        } catch (error) {
            logger.error('Error initializing config watchers:', error);
        }
    }

    private loadAllConfigs() {
        try {
            const files = fs.readdirSync(this.configDir);
            for (const file of files) {
                if (file.endsWith('.yaml')) {
                    this.loadConfig(file);
                }
            }
        } catch (error) {
            logger.error('Error loading configurations:', error);
            throw error;
        }
    }

    private loadConfig(filename: string) {
        try {
            const filePath = path.join(this.configDir, filename);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const config = yaml.load(fileContent);
            this.configs.set(filename, config);
            logger.info(`Loaded config: ${filename}`);
            return config;
        } catch (error) {
            logger.error(`Error loading config ${filename}:`, error);
            throw error;
        }
    }

    public getRpcs(): RPCConfig[] {
        const config = this.configs.get('rpc.yaml') as RPCYamlConfig;
        if (!config || !config.rpcs) {
            throw new Error('RPC configuration not found');
        }
        return config.rpcs;
    }

    public getRpcSettings(): GlobalSettings {
        const config = this.configs.get('rpc.yaml') as RPCYamlConfig;
        if (!config || !config.settings) {
            throw new Error('RPC settings not found');
        }
        return config.settings;
    }

    public getTokens(): any {
        return this.configs.get('tokens.yaml');
    }

    public getSettings(): any {
        return this.configs.get('settings.yaml');
    }

    public validateRpcConfig(config: RPCConfig): boolean {
        return !!(
            config.name &&
            config.wsUrl &&
            config.chainId &&
            config.timeout &&
            config.maxReconnectAttempts &&
            config.reconnectDelay &&
            config.healthCheckInterval
        );
    }

    public reloadConfig(filename: string): void {
        this.loadConfig(filename);
        this.emit('configReloaded', filename);
    }

    public stop(): void {
        // Close all file watchers
        for (const [filename, watcher] of this.watchers) {
            watcher.close();
            logger.info(`Stopped watching ${filename}`);
        }
        this.watchers.clear();
        this.removeAllListeners();
    }
}

export const configLoader = new ConfigLoader();