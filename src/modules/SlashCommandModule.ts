import BaseModule from './BaseModule';
import type { CommandInteraction } from 'discord.js';
import type { BotlyModule, CommandData } from '../../typings';
import type SlashCommandModuleManager from '../moduleManagers/SlashCommandModuleManager';

export default class SlashCommandModule extends BaseModule<CommandInteraction, SlashCommandModuleManager> {
    commandData: CommandData;

    constructor(manager: SlashCommandModuleManager, commandData: CommandData, filepath: string, file: BotlyModule<CommandInteraction>) {
        super(manager, filepath, file);
        this.commandData = commandData;
        this.validateCommandData();
    }

    matches(interaction: CommandInteraction): boolean {
        return interaction.commandName === this.commandData.name;
    }

    private validateCommandData(): void {
        if (typeof this.commandData !== 'object')
            throw new Error(`${this.filename}: exports.commandData must be an instance of SlashCommandBuilder on an object`);
    }
}
