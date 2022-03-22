import BaseModule from './BaseModule';
import type { ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import type { BotlyModule } from '../../typings';

const paramNameRegexp = /(?<=\[).+?(?=\])/g;
const dynamicParamRegexp = /\[.+?\]/g;

type T = ButtonInteraction | SelectMenuInteraction;

export default class DynamicIdModule extends BaseModule<T> {
    id: string;
    regexp: RegExp;
    params: RegExpMatchArray | null;

    constructor(filename: string, file: BotlyModule<T>) {
        super(filename, file);

        this.id = filename.split('.js')[0];

        const { regexp, params } = this.createRegexp();

        this.regexp = regexp;
        this.params = params;

        this.validateId();
    }

    matches(interaction: T): boolean {
        return (
            interaction.customId === this.id
            && this.regexp.test(interaction.customId)
        );
    }

    async listener(interaction: T): Promise<void> {
        const params = this.getParams(interaction);

        if (await this.passesFilterIfExists(interaction, params))
            this.execute(interaction, params);
        else this.callFilterCallbackIfExists(interaction, params);
    };

    private validateId(): void {
        if (this.params && new Set(this.params).size !== this.params.length)
            throw new Error(`${this.filename}: every parameter in id must have a unique name`);
    }

    private createRegexp() {
        const regexp = new RegExp('^' + this.id.replace(dynamicParamRegexp, '(.+)'));
        const params = this.id.match(paramNameRegexp)!;
        return { regexp, params };
    }

    private getParams(interaction: T): { [key: string]: string; } {
        const params: { [key: string]: string; } = {};

        if (!this.params || !this.params.length) return params;

        const match = this.regexp.exec(interaction.customId);

        for (const param of this.params) {
            params[param] = match![this.params.indexOf(param) + 1];
        }

        return params;
    }
}
