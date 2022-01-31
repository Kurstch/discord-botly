import type { BotlyModule } from 'discord-botly';
import type { SelectMenuInteraction } from 'discord.js';

export const { execute }: BotlyModule<SelectMenuInteraction> = {
    execute: interaction => {
        interaction.reply({
            ephemeral: true,
            content: 'Thank you for your feedback!'
        });
        console.log(`feedback from ${interaction.user.tag}: ${interaction.values}`);
    }
};
