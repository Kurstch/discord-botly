import type { ButtonInteraction, Client, CommandInteraction, SelectMenuInteraction } from 'discord.js';

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
    /**
     * Absolute path to the button interaction file directory
     */
    buttonsDir?: string;
    /**
     * Absolute path to the selectMenu interaction file directory
     */
    selectMenuDir?: string;
}

export interface Command {
    data: any,
    execute(interaction: CommandInteraction): Promise<any>
}

/**
 * A registered button/selectMenu customId.
 *
 * If the id has dynamic parameters
 * (ie. `channel-[id]-delete`),
 * then the regexp is a unique regular expression that matches this exact id
 * and params is an array which includes the names of the parameters
 * 
 * @example {
 *     id: 'channel-[channelId]-delete',
 *     params: ['channelId'],
 *     regexp: /^channel-(.+)-delete/
 * }
 */
export interface RegisteredId {
    id: string;
    params: RegExpMatchArray | null;
    regexp: RegExp | null;
    execute(interaction: ButtonInteraction | SelectMenuInteraction, params?: { [key: string]: string; }): void;
}
