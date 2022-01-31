exports.filter = function (interaction) {
    const { member, memberPermissions, guild } = interaction;
    if (!guild || !member || !memberPermissions) return false;
    if (
        guild.ownerId === member.user.id
        || memberPermissions.has('ADMINISTRATOR')
    ) return true;
    return false;
};

exports.filterCallback = function (interaction) {
    interaction.reply({
        ephemeral: true,
        content: 'You do not have permission to use this command'
    });
};
