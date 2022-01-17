import type { ButtonInteraction, Client, ClientEvents, CommandInteraction, Interaction, SelectMenuInteraction } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders'

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

export type ModuleTypes = SelectMenuInteraction | ButtonInteraction | CommandInteraction | keyof ClientEvents;
export type CommandCallback = (interaction: CommandInteraction) => void;
export type EventCallback<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => void;
export type SelectMenuOrButtonCallback<T extends SelectMenuInteraction | ButtonInteraction> = (Interaction: T, params: { [key: string]: string; }) => void;

/**
 * Module code structure
 */
export type BotlyModule<T extends ModuleTypes> =
    T extends SelectMenuInteraction | ButtonInteraction
    ? { execute: SelectMenuOrButtonCallback<T>; }
    : T extends CommandInteraction
    ? {
        commandData: SlashCommandBuilder;
        execute: CommandCallback;
    }
    : { execute: EventCallback<T>; };

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
export interface IdStore {
    customId: string;
    params: RegExpMatchArray | null;
    regexp: RegExp | null;
}

/**
 * Data for a registered module
 */
export type ModuleData<T extends ModuleTypes> =
    T extends SelectMenuInteraction | ButtonInteraction
    ? IdStore & BotlyModule<T>
    : BotlyModule<T>;
