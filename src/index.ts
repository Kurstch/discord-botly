import initEvents from './events';
import initCommands from './commands';
import type { InitArgs } from "../typings/index";
import initButtonInteractions from './buttonInteractions';

export async function init(args: InitArgs) {
    if (args.eventsDir) initEvents(args.client, args.eventsDir);
    if (args.commandsDir) await initCommands(args.client, args.commandsDir);
    if (args.buttonsDir) initButtonInteractions(args.client, args.buttonsDir);
}

export { registerGlobalSlashCommands } from './commands';
