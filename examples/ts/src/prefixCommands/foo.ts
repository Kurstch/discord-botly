import type { BotlyModule } from 'discord-botly';
import type { Message } from 'discord.js';

export const {
    execute
}: BotlyModule<Message> = {
    execute: message => message.reply('bar!')
};
