exports.execute = async (interaction, params) => {
    interaction.deferReply({ ephemeral: true });

    const channel = await interaction.guild.channels.fetch(params.channelId);

    const promises = [];
    for (const [_, message] of await channel.messages.fetch()) {
        promises.push(message.delete());
    }

    await Promise.allSettled(promises);

    interaction.editReply(`Successfully cleared all messages in ${channel.toString()}`);
};
