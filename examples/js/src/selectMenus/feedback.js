exports.execute = interaction => {
    interaction.reply({
        ephemeral: true,
        content: 'Thank you for your feedback!'
    });
    console.log(`feedback from ${interaction.user.tag}: ${interaction.values}`);
};
