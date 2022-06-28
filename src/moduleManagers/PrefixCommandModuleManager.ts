import PrefixCommandModule from '../modules/PrefixCommandModule';
import BaseManager from './BaseManager';
import type { Client, Message } from 'discord.js';
import type { BotlyModule, Prefix, PrefixCommandData } from '../../typings';

export default class PrefixCommandModuleManager extends BaseManager<Message, PrefixCommandModule> {
    prefix: Prefix;

    constructor(prefix: Prefix, client: Client, dir: string) {
        super(client, dir);
        this.prefix = prefix;
    }

    addListener(): void {
        this.client.on('messageCreate', async message => {
            const prefix = await this.getPrefix(message);
            const module = this.modules.find(module => module.matches(message, prefix));
            if (module) module.listener(message);
        });
    }

    createModule(filename: string, module: BotlyModule<Message>): PrefixCommandModule {
        return new PrefixCommandModule(filename, module);
    }

    get commandData(): PrefixCommandData[] {
        return this.modules.map(module => ({
            name: module.filenameWithoutExt,
            description: module.description,
            syntax: module.syntax,
            category: module.category,
            aliases: module.aliases,
        }));
    }

    private async getPrefix(message: Message): Promise<string> {
        if (typeof this.prefix === 'string')
            return this.prefix;
        else return this.prefix(message);
    }
}
