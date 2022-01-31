const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

exports.commandData = new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('give feedback about the bot!');

exports.execute = interaction => {
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
};
