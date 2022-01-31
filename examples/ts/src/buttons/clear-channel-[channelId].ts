import type { ButtonInteraction, Message, TextChannel, ThreadChannel } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { execute }: BotlyModule<ButtonInteraction> = {
    execute: async (interaction, params) => {
        interaction.deferReply({ ephemeral: true })

        const channel = await interaction.guild!.channels.fetch(params.channelId) as TextChannel | ThreadChannel

        const promises: Promise<Message>[] = []
        for (const [_, message] of await channel.messages.fetch()) {
            promises.push(message.delete())
        }

        await Promise.allSettled(promises)

        interaction.editReply(`Successfully cleared all messages in ${channel.toString()}`)
    }
}
