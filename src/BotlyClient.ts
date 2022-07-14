import { Client } from 'discord.js';
import EventModuleManager from './moduleManagers/EventModuleManager';
import DynamicIdModuleManager from './moduleManagers/DynamicIdModuleManager';
import PrefixCommandModuleManager from './moduleManagers/PrefixCommandModuleManager';
import SlashCommandModuleManager from './moduleManagers/SlashCommandModuleManager';
import type { InitArgs } from '../typings';

/**
 * The main manager for all `BotlyModules`;
 * as well as the main hub for a bot.
 */
export default class BotlyClient extends Client {
    /** The main manager for event modules */
    readonly eventManager: EventModuleManager;

    /** The main manager for button interaction modules */
    readonly buttonManager: DynamicIdModuleManager;

    /** The main manager for select menu interaction modules */
    readonly selectMenuManager: DynamicIdModuleManager;

    /** The main manager for slash command modules */
    readonly slashCommandManager: SlashCommandModuleManager;

    /** The main manager for prefix command modules */
    readonly prefixCommandManager: PrefixCommandModuleManager;

    constructor(options: InitArgs) {
        super(options);

        this.eventManager = new EventModuleManager(this, options.eventsDir);
        this.buttonManager = new DynamicIdModuleManager(this, options.buttonsDir);
        this.selectMenuManager = new DynamicIdModuleManager(this, options.selectMenuDir);
        this.slashCommandManager = new SlashCommandModuleManager(this, options.commandsDir);
        this.prefixCommandManager = new PrefixCommandModuleManager(this, options.prefixCommandDir, options.prefix);
    }
}
