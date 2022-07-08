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

export const {
    execute,
    description, // optional
    syntax,      // optional
    category,    // optional
    aliases      // optional
}: BotlyModule<Message> = {
    description: 'See all available commands', // optional
    syntax: 'help <category>',                 // optional
    category: 'general',                       // optional
    aliases: ['h'],                            // optional
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
// prefixCommands/admin/__filter.ts

import { Message } from 'discord.js';
import database from '../../database';

export default async function(message: Message): Promise<boolean> {
    const { adminUsers } = await database.settings.getAdminUsers(message.guildId!);
    if (!adminUsers.includes(message.author.id)) {
        await message.reply('You do not have permission to use this command');
        return false;
    }
    else return true;
}
```

## Catchers

```ts
// prefixCommands/__catch.ts

import UserInputError from '../../errors/UserInputError'
import type { Message } from 'discord.js'
import type { CatchFunction } from 'discord-botly'

const catcher: CatchFunction<Message> = async (error, message) => {
    if (error instanceof UserInputError) {
        await message.reply(error.message)
    } else {
        await message.reply('Oops, something has gone wrong...')
        console.error(error)
    }
}

export default catcher
```

### Making sure that async errors can be caught

Due to an issue with Node.js, rejected promises cannot
be caught if they are not returned or awaited.

For more details, check out these articles:

- [Why asynchronous exceptions are uncatchable with callbacks](https://bytearcher.com/articles/why-asynchronous-exceptions-are-uncatchable/)
- [Error handling with Async/Await in JS](https://blog.segersian.com/2019/04/17/error-handling-async-await/)
- [await vs return vs return await](https://jakearchibald.com/2017/await-vs-return-vs-return-await/)

In these examples we call `message.reply({})` which throws an error
as you cannot send an empty message.

This applies to all [botly modules](README.md#botlymodules) and [filter modules](README.md#filter-modules)

```ts
// The errors thrown here will NOT be caught, because the promise is not returned or awaited

export function execute(message: Message) {
    message.reply({})
}

export async function execute(message: Message) {
    message.reply({})
}
```

```ts
// The errors thrown here will be caught, because the promise is returned or awaited

export const execute = (message: Message) => message.reply({})

export function execute(message: Message) {
    return message.reply({})
}

export async function execute(message: Message) {
    await message.reply({})
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
    const aliasesStr = command.aliases.length ? `\naliases: ${command.aliases.join(', ')}` : ''
    return `**${command.name}**${descriptionStr}${syntaxStr}${aliasesStr}`
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
