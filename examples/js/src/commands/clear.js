const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types');
const { filter, filterCallback } = require('./filters/isAdmin');
const { MessageActionRow, MessageButton } = require('discord.js');

exports.commandData = new SlashCommandBuilder()
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
    );

exports.execute = async interaction => {
    const channelOption = interaction.options.getChannel('channel');
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
};

exports.filter = filter;

exports.filterCallback = filterCallback;
