# Code Samples

## Event Module

```ts
// events/messageReaction.ts

import type { BotlyModule } from 'discord-botly';

export const { execute }: BotlyModule<'messageReactionAdd'> = {
    async execute(reaction, user) {
        console.log({ reaction, user })
    }
}
```

## Slash Command Module

```ts
// commands/ping.ts

import { SlashCommandBuilder } from '@discordjs/builders'
import type { CommandInteraction } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { commandData, execute }: BotlyModule<CommandInteraction> = {
    commandData: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction) {
        await interaction.reply('Pong!')
    }
}
```

## Prefix Command Module

```ts
// prefixCommands/hello.ts

import type { Message } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { execute }: BotlyModule<Message> = {
    async execute(message, args) {
        const name = args[0]
        if (!name) await message.reply('Please mention a name!');
        else await message.reply(`Hello ${name}`);
    }
}
```

## Button Module

```ts
// buttons/say-[message].ts

import type { ButtonInteraction } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { execute }: BotlyModule<ButtonInteraction> = {
    async execute(interaction, params) {
        await interaction.reply(
            params.message // automatically found from filename
        )
    }
}
```

## Select Menu Module

```ts
// selectMenus/give-role.ts

import type { SelectMenuInteraction } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { execute }: BotlyModule<SelectMenuInteraction> = {
    // Since filename does not include dynamic parameters,
    // there is no reason to include the variable in execute params
    async execute(interaction) {
        if (!interaction.inCachedGuild()) return
        const roleId = interaction.values[0]
        await interaction.member.roles.add(roleId)
    }
}
```

## Filters

```ts
// prefixCommands/admin/ban.ts

import type { Message } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const { execute, filter, filterCallback }: BotlyModule<Message> = {
    async filter(message) {
        return (
            !!message.guild &&
            !!message.mentions.members &&
            !!message.mentions.members.size &&
            message.author.id === message.guild.ownerId
        )
    },

    async filterCallback(message) {
        await message.reply('You are not allowed to use this command')
    },

    async execute(message) {
        const member = message.mentions.members!.first()!
        member.ban()
    }
}
```

## Using PrefixCommandData

```ts
// prefixCommands/help.ts

import { Message, MessageEmbed } from 'discord.js'
import { BotlyModule, PrefixCommandData, prefixCommandData } from 'discord-botly'

function commandToDescription(command: PrefixCommandData): string {
    const descriptionStr = command.description ? ` - ${command.description}` : ''
    const syntaxStr = command.syntax ? ` - ${command.syntax}` : ''
    return `**${command.name}**${descriptionStr}${syntaxStr}`
}

export const { execute, description, syntax }: BotlyModule<Message> = {
    description: 'See all available commands',
    syntax: 'help <category>',

    async execute(message, args) {
        const commands = prefixCommandData()
        const [category] = args
        const embed = new MessageEmbed()

        switch (category) {
            case 'games':
                embed
                    .setTitle('Game Commands')
                    .setDescription(
                        commands
                            .filter(command => command.category === 'games')
                            .map(commandToDescription)
                            .join('\n')
                    )
                break
            case 'teams':
                embed
                    .setTitle('Team Commands')
                    .setDescription(
                        commands
                            .filter(command => command.category === 'teams')
                            .map(commandToDescription)
                            .join('\n')
                    )
                break
            default:
                embed
                    .setTitle('The Most Common Commands')
                    .setDescription(`
                        To see commands by category,
                        use \`!help <category>\`.

                        Available categories: \`games\`, \`teams\`

                        All commands:
                        ${commands.map(commandToDescription).join('\n')}
                    `)
        }

        message.reply({ embeds: [embed] })
    }
}
```
