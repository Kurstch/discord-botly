import { Client, Collection } from "discord.js";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import path from 'path';
import fs from 'fs';
import type { Command } from "../typings";

const commands: Collection<string, Command> = new Collection();

export default async function initCommands(client: Client, commandsDir: string) {
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Track successful and failed event registrations
    let successes = 0;
    let errors: string[] = [];

    console.group('\nRegistering commands:');

    for (const file of commandFiles) {
        const command = require(path.join(commandsDir, file)) as Command;
        if (typeof command.execute !== 'function') {
            errors.push(`${file} execute must be a function`);
            continue;
        }
        commands.set(command.data.name, command);
        successes++;
    }


    if (successes > 0) console.info(`Successfully registered ${successes} command${successes > 1 ? 's' : ''}`);
    if (errors.length) {
        console.group(`Failed to register ${errors.length} command${errors.length > 1 ? 's' : ''}:`);
        errors.forEach(err => console.error(err));
        console.groupEnd();
    }
    console.groupEnd();

    client.on('interactionCreate', interaction => {
        if (!interaction.isCommand()) return;
        const command = commands.get(interaction.commandName);
        if (!command) return;
        command.execute(interaction);
    });

}

/**
 * Registers all slash commands for every guild the bot is in.
 *
 * Recommended to run on the client 'ready' event.
 */
export async function registerGlobalSlashCommands(client: Client<true>) {
    const rest = new REST({ version: '9' }).setToken(client.token);

    console.group('\nRegistering global slash commands:');
    try {
        for (const [_, guild] of client.guilds.cache) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guild.id),
                { body: [...commands.map(c => c.data.toJSON()).values()] }
            );
        }
        console.info('Successfully registered all slash commands');
    } catch (error) {
        console.error('Failed to register all slash commands');
        console.error(error);
    }
    console.groupEnd();
}
