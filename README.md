# discord-botly

A simple Discord bot framework which aims to bring easy to understand architecture for making discord bots.

[![NPM](https://nodei.co/npm/discord-botly.png)](https://nodei.co/npm/discord-botly/)

## Table of Contents

- [Usage](#usage)
  - [Initialization](#initialization)
  - [Events](#events)
  - [Slash Commands](#slash-commands)
  - [Button Interactions](#button-interactions)
- [Dynamic Ids](#dynamic-ids)

## Usage

Discord-botly follows a file based architecture,
meaning that for every slash command, button interaction, selectMenu interaction and event there is a separate file.

A project using discord-botly may look something like this.

```
.
|-commands
|   |-foo.js
|   └─help.js
|-events
|   └─ready.js
|-buttons
|   |-channel-delete.js
|   └─channel-[id]-delete.js
|-selectMenus
|   └─poll-[id]-options-[index].ts
|-index.js
|-.env
└─package.json
```

### Initialization

Discord botly has one exposed `init` function which takes the following arguments:

- client: the Discord client
- (optional) eventsDir: the absolute path to the events directory
- (optional) commandsDir: the absolute path to the slash commands directory
- (optional) buttonsDir: the absolute path to the button interactions directory

> Note: SelectMenuInteraction and MessageReaction handlers are not yet implemented.

```js
// index.js

const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
const botly = require('discord-botly');
const path = require('path');

// Load .env
dotenv.config();

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
    eventsDir: path.join(__dirname, './events'),
    commandsDir: path.join(__dirname, './commands'),
    buttonsDir: path.join(__dirname, './buttons')
});

client.login(process.env.TOKEN);

```

### Events

To add client event listeners to botly,
add a file to the `eventsDir` directory,
the file name should match the event name. (eg. `ready.js`)

The file should have one function as the default export
which will be called when the event is run.

```js
// ./events/ready.js

module.exports = function(client) {
    console.log(`client logged in as ${client.user.tag}`)
}
```

### Slash Commands

To add slash commands,
add a command file in the `commandsDir` directory.

The file should have two exports:

- data - the slash command data,
    recommended to use [@discordjs/builders](https://www.npmjs.com/package/@discordjs/builders)
- execute - the function to call when command is run

```js
// ./commands/foo.js

const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports.data = new SlashCommandBuilder()
    .setName('foo')
    .setDescription('Replies with bar');

module.exports.execute = function(interaction) {
    interaction.reply('bar!');
}
```

### Button Interactions

To add a handler for a button interaction,
add a file in the `buttonsDir` directory.

The file should have one function as the default export.

The filename is interpreted as the ButtonInteractions customId,
the id can be static or dynamic (see [Dynamic Ids](#dynamic-ids))

```js
// ./buttons/delete-channel.js

module.exports = function(interaction) {
    interaction.channel.delete();
}
```

```js
// ./button/delete-channel-[channelId].js

module.exports = function(interaction, params) {
    const channel = interaction.guild.channels.cache.get(params.channelId);
    channel.delete()
}
```

### Select Menu Interactions

To add a select menu interaction,
add a file in the `selectMenuDir` directory.

The file should have one function as the default export.

The filename is interpreted as the ButtonInteractions customId,
the id can be static or dynamic (see [Dynamic Ids](#dynamic-ids))

```js
// ./selectMenus/give-role.js

module.exports = function(interaction) {
    interaction.member.roles.add(interaction.values[0]);
}
```

```js
// ./selectMenus/give-[memberId]-role.js

module.exports = function(interaction, params) {
    interaction.guild.members.fetch(params.memberId)
        .then(member => member.roles.add(interaction.values[0]))
}
```

## Dynamic Ids

When adding a button or select menu interaction to the project,
discord-botly interprets the filename as the customId.

It can be a static Id like `channel-delete.js`.

However sometimes you may want to include dynamic properties in the customId.
For example you may want a button point to a specific channel like `channel-926498632463814696-delete`.

For these cases discord-botly offers dynamic ids.
The syntax is very simple: wrap the name of the property in `[]`.

Examples:

- `channel-[id]-delete.js`
- `give-[userId]-role-[roleId].js`.

> Note: property names cannot repeat, so `give-[id]-role-[id].js` is not valid.

The dynamic properties are passed as a second parameter to the callback function.

```js
// ./buttons/give-[userId]-role-[roleId].js

// id: give-690559909934137415-role-926103091953143819

module.exports = function(interaction, params) {

    console.log(params.userId)
    // logs 690559909934137415

    console.log(params.roleId)
    // logs 926103091953143819
}
```
