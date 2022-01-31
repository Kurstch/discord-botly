import { Client, Intents } from 'discord.js';
import * as botly from 'discord-botly';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

botly.init({
    client: client,
    eventsDir: path.join(__dirname, './events'),
    buttonsDir: path.join(__dirname, './buttons'),
    commandsDir: path.join(__dirname, './commands'),
    selectMenuDir: path.join(__dirname, './selectMenus')
});

client.login(process.env.TOKEN);
