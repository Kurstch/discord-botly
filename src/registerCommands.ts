import { slashCommandModuleManager } from './init';

/**
 * Registers all slash commands for every guild the bot is in.
 *
 * Recommended to run on the client 'ready' event.
 */
export function registerGlobalSlashCommands(): void {
    if (!slashCommandModuleManager)
        throw new Error('No slash commands registered');
    slashCommandModuleManager.registerGlobalCommands();
}
