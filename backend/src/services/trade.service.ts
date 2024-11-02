// ... other imports remain the same ...

class TradeService extends EventEmitter {
    private web3Instances: Map<string, Web3> = new Map();
    private isTrading: boolean = false;

    constructor() {
        super();
        try {
            this.initializeWeb3();
            this.listenToOpportunities();
        } catch (error) {
            logger.error('Failed to initialize TradeService:', error);
        }
    }

    private initializeWeb3() {
        const rpcs = configLoader.getRpcs();
        const { privateKey } = configLoader.getSettings().web3;

        // Validate private key
        if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
            logger.error('Invalid private key format. Must be a 32-byte hex string starting with 0x');
            return;
        }

        rpcs.forEach(rpc => {
            try {
                const web3 = new Web3(rpc.url);
                const account = web3.eth.accounts.privateKeyToAccount(privateKey);
                web3.eth.accounts.wallet.add(account);
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

    // ... rest of the code remains the same ...
}

export const tradeService = new TradeService();