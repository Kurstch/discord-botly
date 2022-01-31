import { MessageActionRow, MessageButton } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types';
import * as isAdmin from './filters/isAdmin';
import type { CommandInteraction, TextChannel, ThreadChannel } from 'discord.js';
import type { BotlyModule } from 'discord-botly';

export const {
    commandData,
    execute,
    filter,
    filterCallback
}: BotlyModule<CommandInteraction> = {
    commandData: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear all messages in the channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('From which channel to clear messages')
            .addChannelTypes([
                ChannelType.GuildPrivateThread,
                ChannelType.GuildPublicThread,
                ChannelType.GuildText
            ])
        ),
    execute: async interaction => {
        const channelOption = interaction.options.getChannel('channel') as ThreadChannel | TextChannel | null;
        await interaction.reply({
            ephemeral: true,
            content: `Are you sure you want to delete all messages in ${channelOption ? channelOption.toString() : 'this channel'}?\n`
                + `If you want to cancel, press the "Dismiss message" button below`,
            components: [new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel(`Yes, delete all messages`)
                    .setCustomId(`clear-channel${channelOption ? `-${channelOption.id}` : ''}`)
                    .setStyle('DANGER')
            )]
        });
    },
    ...isAdmin
};
