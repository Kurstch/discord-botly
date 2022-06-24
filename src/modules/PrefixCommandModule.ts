import BaseModule from './BaseModule';
import type { Message } from 'discord.js';
import type { BotlyModule } from '../../typings';

export default class PrefixCommandModule extends BaseModule<Message> {
    readonly prefix: string;
    readonly description?: string;
    readonly category?: string;
    readonly syntax?: string;

    constructor(prefix: string, filename: string, file: BotlyModule<Message>) {
        super(filename, file);

        this.prefix = prefix;
        this.description = file.description;
        this.category = file.category;
        this.syntax = file.syntax;

        this.validateCommandData()
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
