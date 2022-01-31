const { SlashCommandBuilder } = require('@discordjs/builders');

exports.commandData = new SlashCommandBuilder()
    .setName('foo')
    .setDescription('replies with bar');

exports.execute = interaction => interaction.reply('bar!');
