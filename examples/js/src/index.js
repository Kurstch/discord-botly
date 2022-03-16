const { Client, Intents } = require('discord.js');
const botly = require('discord-botly');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

botly.init({
    client: client,
    prefix: '!',
    eventsDir: path.join(__dirname, './events'),
    buttonsDir: path.join(__dirname, './buttons'),
    commandsDir: path.join(__dirname, './commands'),
    selectMenuDir: path.join(__dirname, './selectMenus'),
    prefixCommandDir: path.join(__dirname, './prefixCommands')
});

client.login(process.env.TOKEN);
