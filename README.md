# Discord Botly

Discord Botly is a Discord Bot framework that wraps the [Discord.js](https://github.com/discordjs/discord.js) library.

[![NPM](https://nodei.co/npm/discord-botly.png)](https://nodei.co/npm/discord-botly/)

## Table of Contents

- [What is Discord Botly and why use it?](#what-is-discord-botly-and-why-use-it)
  - [What is the purpose of this framework?](#what-is-the-purpose-of-this-framework)
  - [How does it achieve those things?](#how-does-it-achieve-those-things)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [BotlyModules](#botlymodules)
    - [Code Example](#code-example)
    - [Module exports](#module-exports)
    - [Callback parameters](#callback-parameters)
    - [The filename is important!](#the-filename-is-important)
    - [Dynamic parameter Ids](#dynamic-parameter-ids)
  - [Filter Modules](#filter-modules)
  - [Utils](#utils)
    - [Registering slash commands](#registering-slash-commands)
    - [Prefix Command Data](#prefix-command-data)

## What is Discord Botly and Why Use It?

### What is the Purpose of This Framework?

1. Encourage separating logical parts of code into files.
2. Encourage writing uniform, readable code.
3. Abstract some of the bothersome parts of developing a Discord bot.

### How Does it Achieve Those Things?

1. Botly looks for files (aka. `BotlyModules`) in specified directories, imports the code and creates event listeners on the discord.js Client.

   For example, Botly would read all files from `/commands`, add a listener on `interactionCreate` event and when the event is emitted, Botly will find the matching slash command and call it's `execute` function (exported from file).
2. All `BotlyModules` require similar code structure, so you can tell what's what at a glance.
3. Botly provides multiple utilities, such as:
    - Methods for registering slash commands (so you don't have to mess around with the Discord API)
    - For `ButtonInteraction` and `SelectMenuInteraction` you can use [Dynamic parameter ids](#dynamic-parameter-ids)
    - You can make [filter modules](#filter-modules), which are filters that automatically get applied to [Botly Modules](#botlymodules)
    - Prefix command data is automatically gathered into one constant so you don't have to write help command manually,
      see [prefixCommandData](#prefix-command-data)

The project code may look something like this:

```txt
.
|-commands
|   |-ping.ts
|   |-balance.ts
|   └─admin
|       |-__filter.ts
|       └─ban.ts
|
|-events
|   |-reactions
|   |   |-messageReactionAdd.ts
|   |   └─messageReactionRemove.ts
|   └─ready.js
|
|-buttons
|   |-channel-clear-confirm.ts
|   └─reminder-[id]-subscribe.ts
|
|-selectMenus
|   └─give-[userId]-role.ts
|
|-prefixCommands
|   |-__filter.ts
|   |-ping.ts
|   └─help.ts
|
|-index.ts
|-.env
└─package.json
```

Here Botly will automatically gather the modules from the events, commands, prefixCommands, buttons, and selectMenu directories and assign them to event listeners.

For better organization, modules can be infinitely nested into sub-directories.

## Usage

In the examples below we will be using TypeScript.
JavaScript can also be used, however TypeScript is recommended.

If you wish to see how Discord Botly is used in a real project,
you can view [Dual Bot](https://github.com/Kurstch/DualBot).

### Initialization

```ts
import { Client, Intents } from 'discord.js'
import botly from 'discord-botly'
import path from 'path'
import 'dotenv/config' // Load .env

// Initialize the Discord client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
});

// Initialize discord-botly
botly.init({
    client,
    prefix: '!', // Optional
    eventsDir: path.join(__dirname, './events'), // Optional
    commandsDir: path.join(__dirname, './commands'), // Optional
    buttonsDir: path.join(__dirname, './buttons'), // Optional
    selectMenuDir: path.join(__dirname, './selectMenus'), // Optional
    prefixCommandDir: path.join(__dirname, './prefixCommands') // Optional
});

client.login(process.env.TOKEN);
```

The init method provides Botly the client and points to where the modules are located.

| field                         | value              | description                                                                                                                         |
| ----------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| client                        | Discord.Client     | the used discord.js client                                                                                                          |
| prefix _(optional)_           | string \| function | the prefix to use for prefix commands<br/>optionally, this can be a function that returns a string to allow for  per-guild prefixes |
| eventsDir _(optional)_        | string             | the absolute path to the event module directory                                                                                     |
| commandsDir _(optional)_      | string             | the absolute path to the slash command module directory                                                                             |
| buttonsDir _(optional)_       | string             | the absolute path to the button interaction module directory                                                                        |
| selectMenuDir _(optional)_    | string             | the absolute path to the select menu interaction module directory                                                                   |
| prefixCommandDir _(optional)_ | string             | the absolute path to the prefix command module directory                                                                            |

If you want your bot to have different prefixes (for prefix commands)
for different guilds, then you can give a function to the `prefix` field in init function.

The function can be either synchronous or asynchronous, and must return a `string`.

```ts
botly.init({
    client,
    prefix: (message) => database.settings.getPrefix(message.guild.id),
    prefixCommandDir: path.join(__dirname, './prefixCommands')
});
```

### BotlyModules

A BotlyModule describes what code to run on the specified action.

There are 5 types of modules:

- event - `BotlyModule<'ready' | 'messageReactionAdd' | ...>`
- slash command - `BotlyModule<CommandInteraction>`
- prefix command - `BotlyModule<Message>`
- button - `BotlyModule<ButtonInteraction>`
- select menu - `BotlyModule<SelectMenuInteraction>`

#### Code Example

The code in a BotlyModule follows the same pattern:

```ts
import type { BotlyModule } from 'discord-botly'

export const {
    // Must be exported by all modules
    execute,
    // (Required only for slash commands) Used only for slash commands
    commandData,
}: BotlyModule<moduleType> = {
    // actual implementation here ...
}
```

For more detailed samples see [code-samples.md](code-samples.md)

#### Module Exports

Discord Botly searches for specific `exports` in the BotlyModule files:

| export name    | type                           | module type    | required | description                                                                                                            |
| -------------- | ------------------------------ | -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| execute        | function                       | *              | true     | can run any code, for example, replies 'pong' for '/ping' command                                                      |
| commandData    | instanceof SlashCommandBuilder | slash command  | true     | the slash command data, use [@discordjs/builders](https://www.npmjs.com/package/@discordjs/builders)                   |
| description    | string                         | prefix command | false    | a description of the prefix command, used for [prefixCommandData](#prefix-command-data)                                |
| syntax         | string                         | prefix command | false    | the syntax for the prefix command, used for [prefixCommandData](#prefix-command-data)                                  |
| category       | string                         | prefix command | false    | what category the prefix command is in, used for [prefixCommandData](#prefix-command-data)                             |
| aliases        | string[]                       | prefix command | false    | aliases for the command (eg. `!balance` command may have an alias of `!bal`) [prefixCommandData](#prefix-command-data) |

#### Callback Parameters

The parameters given to the `execute` function as well as [filter modules](#filter-modules) depend on the type of module.

| module type    | parameters                                                                           |
| -------------- | ------------------------------------------------------------------------------------ |
| event          | event params (eg. `ready.ts: (Client<true>)`, `interactionCreate.ts: (Interaction)`) |
| slash command  | \[interaction: CommandInteraction]                                                   |
| prefix command | \[message: Message, args: string[]]                                                  |
| button         | \[interaction: ButtonInteraction, params: {[key: string]: string}]                   |
| select menu    | \[interaction: SelectMenuInteraction, params: {[key: string]: string}]               |

#### The Filename is Important

Botly looks at the filename for information on what to do with the module.

| module type              | purpose                                                                                                            | example                                                   | will match                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| events                   | interpreted as the event name                                                                                      | `ready.ts`, `messageReactionAdd.ts`                       |                                                                                            |
| slash commands           | interpreted as the command name                                                                                    | `ping.ts`, `ban.ts`                                       | `/ping`, `/ban`                                                                            |
| prefix commands          | interpreted as the command                                                                                         | `ping.ts`, `ban.ts`                                       | `!ping`, `!ban` (if prefix is set to `!`)                                                  |
| buttons and select menus | interpreted as the button's or select menu's customId, can include [Dynamic parameter ids](#dynamic-parameter-ids) | `give-member-guest-role.ts`, `reminder-[id]-subscribe.ts` | interaction with customId of `give-member-guest-role`, `reminder-21425252661616-subscribe` |

#### Dynamic Parameter Ids

In many cases you may want to include dynamic values in the `ButtonInteraction.customId` or `SelectMenuInteraction.customId`.

For this case Botly allows you to use **dynamic parameters** in the filename. Botly then automatically creates a RegExp that matches any `customId` based on the filename.

You can add a dynamic parameter to a filename by wrapping the parameter name in `[]` brackets.

For example, the file `reminder-[id]-subscribe.ts` will create the RegExp  `/^reminder-(.+)-subscribe$/` that would match `reminder-294716294572593701-subscribe`.

The parameters are passed to all callbacks as the second param inside an object. So of the filename is `reminder-[id]-subscribe.ts`, then the callback will receive `ButtonInteraction, { id: string }`.

| filename                                    | RegExp                               | example customId                                             | callback parameters                |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ | ---------------------------------- |
| reminder-[id]-unsubscribe.ts                | /^reminder-(.+)-unsubscribe/         | reminder-294716294572593701-subscribe                        | { id: string }                     |
| get-role-[id].ts                            | /^get-role-(.+).ts/                  | get-role-294716294572593701                                  | { id: string }                     |
| give-user-[userId]-role-[roleId]-confirm.ts | /^give-user-(.+)-role-(.+)-confirm$/ | give-user-294716294572593701-role-294716294572593701-confirm | { userId: string, roleId: string } |

If a dynamic id has multiple parameters, eg. `give-user-[userId]-role-[roleId]-confirm.ts` then the parameters **must** have different names. So `give-user-[id]-role-[id]-confirm.ts` is not valid and will throw an error.

The parameters will be provided in the execute function:

```ts
// buttons/give-user-[userId]-role-[roleId]-confirm.ts
import type { BotlyModule } from 'discord-botly'
import type { ButtonInteraction } from 'discord.js'

export const { execute }: BotlyModule<ButtonInteraction> = {
    execute: (interaction, params) => {
        console.log(params.userId)
        console.log(params.roleId)
    }
}
```

### Filter Modules

If you need create filters for multiple [Botly Modules](#botlymodules),
such as checking that the user can use admin commands,
you can use `filter modules`.

Filter modules are files with the name `__filter.(js/ts)` that export a filter function.
The filter gets applied to all [Botly Modules](#botlymodules)
in the directory and its sub-directories.

```txt
prefixCommands
    |-admin
    |   | __filter.ts
    |   |-ban.ts
    |   └─kick.ts
    |
    |-__filter.ts
    |-ping.ts
    └─help.ts
```

In this example we have 2 filter modules:

- prefixCommands/__filter.ts
- prefixCommands/admin/__filter.ts

Since `prefixCommands/__filter.ts` is in the prefixCommands directory,
it gets applied to all prefix commands.

`prefixCommands/admin/__filter.ts` however,
gets applied ony to commands in the `admin` directory.

The actual code is super simple: it's just a function that returns a `boolean`
or `Promise<boolean>`. The function must be a default export. The parameters passed
to the filter function depend on the directory
(see [callback parameters](#callback-parameters)) ie. filter in prefixCommands dir
will recieve `message: Message, args: string[]`, slashCommand: `interaction: CommandInteraction` etc.
You can use `FilterFunction` type exported from `discord-botly` ([code sample](code-samples.md#filters)).

```ts
// Example of `prefixCommands/admin/__filter.ts`
export default async function(message: Message): Promise<boolean> {
    const { adminUsers } = await database.settings.getAdminUsers(message.guildId!);
    if (!adminUsers.includes(message.author.id)) {
        await message.reply('You do not have permission to use this command');
        return false;
    }
    else return true;
}
```

The above example for `prefixCommands/admin/__filter.ts` would check whether
the message author is an admin the guild and return true or false appropriately.
This filter would be applied to all commands in the `admin` directory and
any sub-directories.

### Utils

#### Registering Slash Commands

For registering slash commands, you can use `registerGlobalSlashCommands` function that will register the commands for all guilds that the bot is in.

It required the client to be logged in, so call it on the `ready` event

```ts
// events/ready.ts
import { registerGlobalSlashCommands } from 'discord-botly' 
import type { BotlyModule } from 'discord-botly'

export const { execute }: BotlyModule<'ready'> = {
    execute: client => {
        registerGlobalSlashCommands(client)
    }
}
```

#### Prefix Command Data

This is a utility that automatically gathers the `name`, `description`,
`syntax` and `category` for all of your prefix commands
in one easy-to-access place.

For an example on how `prefixCommandData` can be used, see [code-samples](code-samples.md#using-prefixcommanddata)

```ts
import { prefixCommandData } from 'discord-botly'

console.log(prefixCommandData())
/*
    Logs: [
        { name: 'help', description: 'See available commands', syntax: 'help', category: undefined, aliases: ['h'] },
        { name: 'ban', description: 'Ban a member', syntax: 'ban @member', category: 'admin', aliases: [] },
        { name: 'coin', description: 'Toss a coin', syntax: 'coin', category: 'games', aliases: ['c'] },
    ]
*/
```

The `name`, `description`, `syntax`, `category` and `aliases` are automatically
gathered from the prefix command modules.

The `name` comes from the filename, and the rest comes from exports.

```ts
// prefixCommands/games/coin.ts

import type { Message } from 'discord.js'
import type { BotlyModule } from 'discord-botly'

export const {
    execute,
    category,
    description,
    syntax,
    aliases,
}: BotlyModule<Message> = {
    description: 'Replies with a greeting',
    syntax: '!hello <name>',
    category: 'games',
    aliases: ['c'],
    execute: message => message.reply(Math.random() > 0.5 ? 'You got tails!' : 'You got heads!'),
}
```
