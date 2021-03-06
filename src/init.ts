import EventModuleManager from './moduleManagers/EventModuleManager';
import DynamicIdModuleManager from './moduleManagers/DynamicIdModuleManager';
import SlashCommandModuleManager from './moduleManagers/SlashCommandModuleManager';
import PrefixCommandModuleManager from './moduleManagers/PrefixCommandModuleManager';
import type { InitArgs } from '../typings';

// Export the slashCommandModuleManager
// to allow the user to use the registerGlobalCommands function
export let slashCommandModuleManager: SlashCommandModuleManager;
export let prefixCommandModuleManager: PrefixCommandModuleManager;

export function init(config: InitArgs) {
    const {
        eventsDir,
        buttonsDir,
        commandsDir,
        selectMenuDir,
        prefixCommandDir,
        prefix,
        client,
    } = config;

    if (eventsDir)
        new EventModuleManager(client, eventsDir);
    if (buttonsDir)
        new DynamicIdModuleManager(client, buttonsDir);
    if (commandsDir)
        slashCommandModuleManager = new SlashCommandModuleManager(client, commandsDir);
    if (selectMenuDir)
        new DynamicIdModuleManager(client, selectMenuDir);
    if (prefixCommandDir && prefix)
        prefixCommandModuleManager = new PrefixCommandModuleManager(prefix, client, prefixCommandDir);
}
