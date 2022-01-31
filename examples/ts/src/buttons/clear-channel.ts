import type { ButtonInteraction, Message } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { execute }: BotlyModule<ButtonInteraction> = {
    execute: async interaction => {
        interaction.deferReply({ ephemeral: true })

        const promises: Promise<Message>[] = []
        for (const [_, message] of await interaction.channel!.messages.fetch()) {
            promises.push(message.delete())
        }

        await Promise.allSettled(promises)

        interaction.editReply(`Successfully cleared all messages in ${interaction.channel!.toString()}`)
    }
}
