import DynamicIdModule from '../modules/DynamicIdModule';
import BaseManager from './BaseManager';
import type { ButtonInteraction, Client, SelectMenuInteraction } from 'discord.js';
import type { DirReadResult } from './BaseManager';
import type { BotlyModule } from '../../typings';

type T = ButtonInteraction | SelectMenuInteraction;
type TypeStr = 'button interaction' | 'select menu interaction';

export default class DynamicIdModuleManager extends BaseManager<T, DynamicIdModule> {
    constructor(client: Client, dir: string, type: TypeStr) {
        super(client, dir, type);
    }

    addListener(): void {
        this.client.on('interactionCreate', interaction => {
            if (!interaction.isButton() && !interaction.isSelectMenu()) return;
            const module = this.modules.find(module => module.matches(interaction));
            if (module) module.listener(interaction);
        });
    }

    createModule(file: DirReadResult, module: BotlyModule<T>): DynamicIdModule {
        return new DynamicIdModule(file.name, module);
    }
}
