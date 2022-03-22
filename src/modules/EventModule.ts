import BaseModule from './BaseModule';
import type { ClientEvents } from 'discord.js';

export default class EventModule<T extends keyof ClientEvents> extends BaseModule<T> {
    matches(): boolean {
        // Since there can be only one event module per event,
        // no matching is required, so just return true.
        return true;
    }
}
