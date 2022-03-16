import type { BotlyModule } from 'discord-botly';
import type { Message } from 'discord.js';

export const {
    execute,
    filter,
    filterCallback
}: BotlyModule<Message> = {
    execute: (message, args) => message.reply(`Hello, ${args[0]}!`),
    filter: (_, args) => !!args.length,
    filterCallback: (message) => message.reply('Please provide a name, eg. `!hello <username>`')
};
