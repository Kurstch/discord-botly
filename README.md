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
