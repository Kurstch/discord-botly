import PrefixCommandModule from '../modules/PrefixCommandModule';
import BaseManager from './BaseManager';
import type { Client, Message } from 'discord.js';
import type { DirReadResult } from './BaseManager';
import type { BotlyModule } from '../../typings';

export default class PrefixCommandModuleManager extends BaseManager<Message, PrefixCommandModule> {
    prefix!: string;

    constructor(prefix: string, client: Client, dir: string) {
        super(client, dir, { prefix });
    }

    addListener(): void {
        this.client.on('messageCreate', message => {
            const module = this.modules.find(module => module.matches(message));
            if (module) module.listener(message);
        });
    }

    createModule(file: DirReadResult, module: BotlyModule<Message>): PrefixCommandModule {
        return new PrefixCommandModule(this.prefix, file.name, module);
    }
}
