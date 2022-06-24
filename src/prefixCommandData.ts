import { prefixCommandModuleManager } from './init';

/**
 * Returns an array of prefix commands.
 */
export function prefixCommandData() {
    if (!prefixCommandModuleManager)
        throw new Error('No slash commands registered');
    return prefixCommandModuleManager.commandData;
}

