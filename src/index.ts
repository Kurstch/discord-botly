import { init } from './init';
import { registerGlobalSlashCommands } from './registerCommands';
import { prefixCommandData } from './prefixCommandData';

// Export in multiple ways to allow developers to
// import in their preferred way

export {
    init,
    registerGlobalSlashCommands,
    prefixCommandData,
};

export default {
    init,
    registerGlobalSlashCommands,
    prefixCommandData,
};
