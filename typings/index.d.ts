import type { Client } from 'discord.js';

/**
 * Initializes botly
 */
declare function init(args: InitArgs): void;

export interface InitArgs {
    /**
     * Discord bot token
     */
    client: Client;
    /**
     * Absolute path to the Client event directory
     */
    eventsDir?: string;
}
