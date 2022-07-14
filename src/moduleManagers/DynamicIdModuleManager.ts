import DynamicIdModule from '../modules/DynamicIdModule';
import BaseManager from './BaseManager';
import type { ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import type { BotlyModule } from '../../typings';

type T = ButtonInteraction | SelectMenuInteraction;

export default class DynamicIdModuleManager extends BaseManager<T, DynamicIdModule> {
    protected addListener(): void {
        this.client.on('interactionCreate', interaction => {
            if (!interaction.isButton() && !interaction.isSelectMenu()) return;
            const module = this.modules.find(module => module.matches(interaction));
            if (module) module.listener(interaction as ButtonInteraction, module.getParams(interaction));
        });
    }

    protected createModule(filepath: string, module: BotlyModule<T>): DynamicIdModule {
        return new DynamicIdModule(this, filepath, module);
    }
}
