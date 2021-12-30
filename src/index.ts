import initEvents from './events';
import type { InitArgs } from "../typings/index";

export function init(args: InitArgs) {
    if (args.eventsDir) initEvents(args.client, args.eventsDir);
}
