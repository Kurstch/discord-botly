import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { commandStore } from "./index";
import type { Client } from "discord.js";

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
                { body: [...commandStore.map(c => c.commandData.toJSON()).values()] }
            );
        }
        console.info('Successfully registered all slash commands');
    } catch (error) {
        console.error('Failed to register all slash commands');
        console.error(error);
    }
    console.groupEnd();
}
