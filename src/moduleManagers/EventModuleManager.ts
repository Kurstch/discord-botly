import EventModule from '../modules/EventModule';
import BaseManager from './BaseManager';
import type { Client, ClientEvents } from 'discord.js';
import type { BotlyModule, FuncParams } from '../../typings';
import type { DirReadResult } from './BaseManager';

export default class EventModuleManager<T extends keyof ClientEvents> extends BaseManager<T, EventModule<T>> {
    constructor(client: Client, dir: string) {
        super(client, dir, 'event');
    }

    addListener(): void {
        // Since each event module if for a different event,
        // loop through them and add listeners individually
        for (const module of this.modules) {
            this.client.on(module.filenameWithoutExt, (...args) =>
                module.listener(...args as FuncParams<T>)
            );
        }
    }

    createModule(file: DirReadResult, module: BotlyModule<T>): EventModule<T> {
        return new EventModule(file.name, module);
    }
}
