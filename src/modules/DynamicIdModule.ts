import BaseModule from './BaseModule';
import type { ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import type { BotlyModule } from '../../typings';
import type DynamicIdModuleManager from '../moduleManagers/DynamicIdModuleManager';

const paramNameRegexp = /(?<=\[).+?(?=\])/g;
const dynamicParamRegexp = /\[.+?\]/g;

type T = ButtonInteraction | SelectMenuInteraction;

export default class DynamicIdModule extends BaseModule<T, DynamicIdModuleManager> {
    id: string;
    regexp: RegExp;
    params: RegExpMatchArray | null;

    constructor(manager: DynamicIdModuleManager, filepath: string, file: BotlyModule<T>) {
        super(manager, filepath, file);

        this.id = this.filenameWithoutExt;

        const { regexp, params } = this.createRegexp();

        this.regexp = regexp;
        this.params = params;

        this.validateId();
    }

    matches(interaction: T): boolean {
        return (
            interaction.customId === this.id
            || this.regexp.test(interaction.customId)
        );
    }

    getParams(interaction: T): { [key: string]: string; } {
        const params: { [key: string]: string; } = {};

        if (!this.params || !this.params.length) return params;

        const match = this.regexp.exec(interaction.customId);

        if (!match) return params;

        for (const param of this.params) {
            params[param] = match[this.params.indexOf(param) + 1];
        }

        return params;
    }

    private validateId(): void {
        if (this.params && new Set(this.params).size !== this.params.length)
            throw new Error(`${this.filename}: every parameter in id must have a unique name`);
    }

    private createRegexp() {
        const regexp = new RegExp('^' + this.id.replace(dynamicParamRegexp, '(.+)'));
        const params = this.id.match(paramNameRegexp);
        return { regexp, params };
    }
}
