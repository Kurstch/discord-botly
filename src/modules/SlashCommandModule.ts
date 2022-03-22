import BaseModule from './BaseModule';
import type { CommandInteraction } from 'discord.js';
import type { BotlyModule, CommandData } from '../../typings';

export default class SlashCommandModule extends BaseModule<CommandInteraction> {
    commandData: CommandData;

    constructor(commandData: CommandData, filename: string, file: BotlyModule<CommandInteraction>) {
        super(filename, file);
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
