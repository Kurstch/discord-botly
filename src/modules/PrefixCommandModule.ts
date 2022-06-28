import BaseModule from './BaseModule';
import type { Message } from 'discord.js';
import type { BotlyModule } from '../../typings';

export default class PrefixCommandModule extends BaseModule<Message> {
    readonly description?: string;
    readonly category?: string;
    readonly syntax?: string;
    readonly aliases: string[];

    constructor(filename: string, file: BotlyModule<Message>) {
        super(filename, file);

        this.description = file.description;
        this.category = file.category;
        this.syntax = file.syntax;
        this.aliases = file.aliases ?? [];

        this.validateCommandData()
    }

    async listener(message: Message): Promise<void> {
        const args = message.content
            .trim()
            .split(' ')
            .slice(1)
            .filter(s => !!s.length);

        if (await this.passesFilterIfExists(message, args))
            this.execute(message, args);
        else this.callFilterCallbackIfExists(message, args);
    }

    matches(message: Message, prefix: string): boolean {
        const first = message.content.trimStart().split(' ')[0];
        const cmd = first.trim().substring(prefix.length);

        const hasPrefix = first.startsWith(prefix);
        const isCommand =
            cmd === this.filenameWithoutExt
            || this.aliases.includes(cmd);

        if (!hasPrefix) return false;
        if (!isCommand) return false;
        return true;
    }

    private validateCommandData(): void {
        const isValid = (val: any) => typeof val === 'string' || typeof val === 'undefined';

        if (!isValid(this.description))
            throw new Error(`${this.filename}: exports.description must be undefined or a string`);
        if (!isValid(this.syntax))
            throw new Error(`${this.filename}: exports.syntax must be undefined or a string`);
        if (!isValid(this.category))
            throw new Error(`${this.filename}: exports.category must be undefined or a string`);
    }
}
