import { MessageActionRow, MessageSelectMenu } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { BotlyModule } from 'discord-botly';

export const {
    commandData,
    execute
}: BotlyModule<CommandInteraction> = {
    commandData: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('give feedback about the bot!'),
    execute: interaction => {
        interaction.reply({
            ephemeral: true,
            content: 'How do you like this bot?',
            components: [new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('feedback')
                    .setOptions([
                        {
                            label: 'it\'s great',
                            value: '2'
                        },
                        {
                            label: 'it\'s ok',
                            value: '1'
                        },
                        {
                            label: 'it\'s bad',
                            value: '0'
                        }
                    ])
            )]
        });
    }
};
