import BaseModule from './BaseModule';
import type { Message } from 'discord.js';
import type { BotlyModule } from '../../typings';
import type PrefixCommandModuleManager from '../moduleManagers/PrefixCommandModuleManager';

export default class PrefixCommandModule extends BaseModule<Message, PrefixCommandModuleManager> {
    readonly description?: string;
    readonly category?: string;
    readonly syntax?: string;
    readonly aliases: string[];

    constructor(manager: PrefixCommandModuleManager, filepath: string, file: BotlyModule<Message>) {
        super(manager, filepath, file);

        this.description = file.description;
        this.category = file.category;
        this.syntax = file.syntax;
        this.aliases = file.aliases ?? [];

        this.validateCommandData();
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
        const isValid = (val: unknown) => typeof val === 'string' || typeof val === 'undefined';

        if (!isValid(this.description))
            throw new Error(`${this.filename}: exports.description must be undefined or a string`);
        if (!isValid(this.syntax))
            throw new Error(`${this.filename}: exports.syntax must be undefined or a string`);
        if (!isValid(this.category))
            throw new Error(`${this.filename}: exports.category must be undefined or a string`);
    }
}
