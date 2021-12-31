import type { Client, CommandInteraction } from 'discord.js';

/**
 * Initializes botly
 */
declare function init(args: InitArgs): void;
/**
 * Registers all slash commands for every guild the bot is in globally.
 *
 * Recommended to run on the client 'ready' event.
 */
declare async function registerGlobalSlashCommands(client: Client<true>): Promise<void>;

export interface InitArgs {
    /**
     * Discord bot token
     */
    client: Client;
    /**
     * Absolute path to the Client event directory
     */
    eventsDir?: string;
    /**
     * Absolute path to the slash command interaction file directory
     */
    commandsDir?: string;
}

export interface Command {
    data: any,
    execute(interaction: CommandInteraction): Promise<any>
}
