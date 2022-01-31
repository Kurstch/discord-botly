import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { BotlyModule } from 'discord-botly';

export const {
    commandData,
    execute
}: BotlyModule<CommandInteraction> = {
    commandData: new SlashCommandBuilder()
        .setName('foo')
        .setDescription('replies with bar'),
    execute: interaction => interaction.reply('bar!')
};
