import { init } from './init';
import { registerGlobalSlashCommands } from './registerCommands';

// Export in multiple ways to allow developers to
// import in their preferred way

export {
    init,
    registerGlobalSlashCommands,
};

export default {
    init,
    registerGlobalSlashCommands,
};
