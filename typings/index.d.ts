import type {
    Client,
    Interaction,
    ClientEvents,
    MessageReaction,
    ButtonInteraction,
    CommandInteraction,
    SelectMenuInteraction,
    Message
} from 'discord.js';
import type { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders'

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
     * The Discord client
     */
    client: Client;
    /**
     * The prefix used for prefix commands.
     * @example "!"
     */
    prefix?: string;
    /**
     * Absolute path to the Client event directory
     */
    eventsDir?: string;
    /**
     * Absolute path to the prefix command file directory
     */
    prefixCommandDir?: string;
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

/**
 * All of the accepted BotlyModule Types
 */
export type ModuleTypes =
    SelectMenuInteraction
    | ButtonInteraction
    | CommandInteraction
    | keyof ClientEvents
    | Message;

/**
 * Determines what kind of params the BotlyModule functions should have
 * depending on the BotlyModule Type
 */
export type FuncParams<T extends ModuleTypes> =
    T extends CommandInteraction ? [interaction: T]
    : T extends SelectMenuInteraction | ButtonInteraction ? [interaction: ButtonInteraction | SelectMenuInteraction, params: { [key: string]: string; }]
    : T extends Message ? [message: Message, args: string[]]
    : ClientEvents[T]

export type CommandData = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>

/**
 * Module code structure
 */
export type BotlyModule<T extends ModuleTypes> =
    T extends CommandInteraction ? BotlyModuleCoreFunctions<T> & {
        commandData: CommandData;
    } : BotlyModuleCoreFunctions<T>;

interface BotlyModuleCoreFunctions<T extends ModuleTypes> {
    execute: (...args: FuncParams<T>) => void;
    filter?: (...args: FuncParams<T>) => boolean | Promise<boolean>;
    filterCallback?: (...args: FuncParams<T>) => void;
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
export interface IdStore {
    customId: string;
    params: RegExpMatchArray | null;
    regexp: RegExp | null;
}

/**
 * Data for a registered module
 */
export type ModuleData<T extends ModuleTypes> =
    T extends SelectMenuInteraction | ButtonInteraction ? BotlyModule<T> & IdStore
    : BotlyModule<T>

/** @deprecated */
export type CommandCallback = (interaction: CommandInteraction) => void;
/** @deprecated */
export type CommandFilter = (interaction: CommandInteraction) => boolean | Promise<boolean>;
/** @deprecated */
export type EventCallback<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => void;
/** @deprecated */
export type EventFilter<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => boolean | Promise<boolean>;
/** @deprecated */
export type SelectMenuOrButtonCallback<T extends SelectMenuInteraction | ButtonInteraction> = (Interaction: T, params: { [key: string]: string; }) => void;
/** @deprecated */
export type SelectMenuOrButtonFilter<T extends SelectMenuInteraction | ButtonInteraction> = (Interaction: T, params: { [key: string]: string; }) => boolean | Promise<boolean>;
