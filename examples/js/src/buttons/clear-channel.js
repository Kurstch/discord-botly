exports.execute = async interaction => {
    interaction.deferReply({ ephemeral: true });

    const promises = [];
    for (const [_, message] of await interaction.channel.messages.fetch()) {
        promises.push(message.delete());
    }

    await Promise.allSettled(promises);

    interaction.editReply(`Successfully cleared all messages in ${interaction.channel.toString()}`);
};
