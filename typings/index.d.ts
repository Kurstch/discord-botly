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
export function init(args: InitArgs): void;

/**
 * Registers all slash commands for every guild the bot is in globally.
 *
 * Recommended to run on the client 'ready' event.
 */
export async function registerGlobalSlashCommands(client: Client<true>): Promise<void>;

export function prefixCommandData(): PrefixCommandData[];

export default {
    init,
    registerGlobalSlashCommands,
}

export type Prefix = string | ((message: Message) => Promise<string> | string)

export interface InitArgs {
    /**
     * The Discord client
     */
    client: Client;
    /**
     * The prefix used for prefix commands.
     * @example "!"
     * @example ```ts
     * (guild) => database.settings.getPrefix(guild.id)
     * ```
     */
    prefix?: Prefix;
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
    : T extends SelectMenuInteraction ? [interaction: SelectMenuInteraction, params: { [key: string]: string; }]
    : T extends ButtonInteraction ? [interaction: ButtonInteraction, params: { [key: string]: string; }]
    : T extends Message ? [message: Message, args: string[]]
    : ClientEvents[T]

export type CommandData = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>

export type FilterFunction<T extends ModuleTypes> = (...args: FuncParams<T>) => boolean | Promise<boolean>;

/**
 * Type for catch module's default exported function.
 * For more info see see README#catch-modules, [issue#44](https://github.com/Kurstch/discord-botly/issues/44)
 */
export type CatchFunction<T extends ModuleTypes> = (error: Error, ...args: FuncParams<T>) => void | Promise<void>;

/**
 * Module code structure
 */
export type BotlyModule<T extends ModuleTypes> =
    T extends CommandInteraction ? BotlyModuleCoreFunctions<T> & SlashCommandModule
    : T extends Message ? BotlyModuleCoreFunctions<T> & PrefixCommandModule
    : BotlyModuleCoreFunctions<T>;

interface BotlyModuleCoreFunctions<T extends ModuleTypes> {
    execute: (...args: FuncParams<T>) => void;
}

interface SlashCommandModule {
    commandData: CommandData;
}

interface PrefixCommandModule {
    description?: string;
    category?: string;
    syntax?: string;
    aliases?: string[];
}

export interface PrefixCommandData extends PrefixCommandModule {
    name: string;
    aliases: string[];
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
