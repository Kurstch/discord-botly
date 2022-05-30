const { SlashCommandBuilder } = require('@discordjs/builders');

exports.commandData = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('replies pong');

exports.execute = async interaction => {
    interaction.reply('pong!');
};
