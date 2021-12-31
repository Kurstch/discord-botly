import initEvents from './events';
import initCommands from './commands';
import type { InitArgs } from "../typings/index";

export function init(args: InitArgs) {
    if (args.eventsDir) initEvents(args.client, args.eventsDir);
    if (args.commandsDir) initCommands(args.client, args.commandsDir);
}

export { registerGlobalSlashCommands } from './commands';
