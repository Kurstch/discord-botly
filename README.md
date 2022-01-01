# discord-botly

A Discord bot framework

## Events

To add client event listeners to botly,
simply pass `eventsDir` to botly `init`
and add a event file in that directory.

The file name should match the event name. (eg. `ready.js`)

The file should have one function as the default export
which will be called when the event is run.

```js
// ./events/ready.js

module.exports = function(client) {
    console.log(`client logged in as ${client.user.tag}`)
}
```

## Slash Commands

To add slash commands,
pass `commandsDir` to `botly.init`
and add a command file in that directory.

The file should have to exports:

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

## Button Interactions

To add a handler for a button interaction,
pass `buttonsDir` to `botly.init`
and add a file in that directory.

The file should have one function as the default export.

The filename should match the buttons customId.
For example:
If you have a button with `delete-channel` as the customId,
the filename should be `delete-channel.js`.

```js
// ./buttons/delete-channel.js

module.exports = function(interaction) {
    interaction.channel.delete();
}
```

The filename can also include dynamic parameters.
For example: If you have a button with `delete-channel-926498635263814696` as the customId,
the filename should be `delete-channel-[channelId].js`.
All dynamic parameters will be passed to the exported function as the second parameter as `{parameterName: parameterValue}`.

```js
// ./button/delete-channel-[channelId].js

module.exports = function(interaction, params) {
    const channel = interaction.guild.channels.cache.get(params.channelId);
    channel.delete()
}
```
