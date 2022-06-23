const { SlashCommandBuilder } = require('@discordjs/builders');

exports.commandData = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('bans a member')
    .addUserOption(option => option
        .setName('member')
        .setDescription('whom to ban')
        .setRequired(true)
    );

exports.execute = async interaction => {
    const user = interaction.options.getUser('member', true);
    interaction.guild.members.ban(user);
};
