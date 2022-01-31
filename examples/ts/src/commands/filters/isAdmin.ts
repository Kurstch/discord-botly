import type { CommandInteraction } from 'discord.js';

export function filter(interaction: CommandInteraction) {
    const { member, memberPermissions, guild } = interaction;
    if (!guild || !member || !memberPermissions) return false;
    if (
        guild.ownerId === member.user.id
        || memberPermissions.has('ADMINISTRATOR')
    ) return true;
    return false;
}

export function filterCallback(interaction: CommandInteraction) {
    interaction.reply({
        ephemeral: true,
        content: 'You do not have permission to use this command'
    });
}
