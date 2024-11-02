import { Telegraf } from 'telegraf';
import { configLoader } from '../utils/config.loader';
import logger from '../utils/logger';

class TelegramService {
    private bot: Telegraf;
    private chatId: string;

    constructor() {
        const { botToken, chatId } = configLoader.getSettings().telegram;
        this.bot = new Telegraf(botToken);
        this.chatId = chatId;
        this.initialize();
    }

    private initialize() {
        this.bot.command('status', async (ctx) => {
            if (ctx.chat.id.toString() !== this.chatId) return;
            
            // Send system status
            const status = await this.getSystemStatus();
            ctx.reply(status);
        });

        this.bot.launch().catch(error => {
            logger.error('Failed to launch Telegram bot:', error);
        });

        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    public async sendMessage(message: string): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(this.chatId, message);
            logger.info('Telegram message sent successfully');
        } catch (error) {
            logger.error('Failed to send Telegram message:', error);
        }
    }

    private async getSystemStatus(): Promise<string> {
        // TODO: Implement system status report
        return 'System is running...';
    }

    public stop() {
        this.bot.stop('SIGTERM');
        logger.info('Telegram service stopped');
    }
}

export const telegramService = new TelegramService();
