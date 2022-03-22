import BaseModule from './BaseModule';
import type { Message } from 'discord.js';
import type { BotlyModule } from '../../typings';

export default class PrefixCommandModule extends BaseModule<Message> {
    readonly prefix: string;

    constructor(prefix: string, filename: string, file: BotlyModule<Message>) {
        super(filename, file);
        this.prefix = prefix;
    }

    async listener(message: Message): Promise<void> {
        const parts = message.content
            .trim()
            .substring(this.prefix.length)
            .split(' ');
        const args = parts
            .slice(1)
            .filter(s => !!s.length);

        if (await this.passesFilterIfExists(message, args))
            this.execute(message, args);
        else this.callFilterCallbackIfExists(message, args);
    }

    matches(message: Message): boolean {
        const first = message.content.trimStart().split(' ')[0];

        const hasPrefix = first.startsWith(this.prefix);
        const isCommand = first.substring(this.prefix.length) === this.filenameWithoutExt;

        if (!hasPrefix) return false;
        if (!isCommand) return false;
        return true;
    }
}
