import path from 'path';
import walkdir from 'walkdir';
import type { Client } from 'discord.js';
import type { BotlyModule, ModuleTypes } from '../../typings';
import type DynamicIdModule from '../modules/DynamicIdModule';
import type PrefixCommandModule from '../modules/PrefixCommandModule';
import type SlashCommandModule from '../modules/SlashCommandModule';
import type EventModule from '../modules/EventModule';

export interface DirReadResult {
    path: string;
    name: string;
}

/**
 * Base class for reading and initializing modules.
 */
export default abstract class BaseManager<
    T extends ModuleTypes,
    M extends PrefixCommandModule
    | SlashCommandModule
    | DynamicIdModule
    // @ts-expect-error - expect T to be `keyof ClientEvents`
    | EventModule<T>>
{
    client: Client;
    modules: M[];
    dir: string;

    constructor(client: Client, dir: string) {
        const files = this.readDir(dir);
        const modules = this.importModules(files);

        this.client = client;
        this.modules = modules;
        this.dir = dir;

        this.addListener();
        this.logResults();
    }

    private readDir(dir: string): string[] {
        return walkdir.sync(dir)
            .filter(filename => filename.endsWith('.js'));
    }

    private importModules(files: string[]): M[] {
        return files.map(filepath => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const result = require(filepath);
            return this.createModule(path.basename(filepath), result);
        });
    }

    /**
     * Console logs the results after all modules have been initialized
     * for the given directory.
     */
    private logResults(): void {
        const amount = this.modules.length;
        console.log(`> Successfully initialized ${amount} module(s) from ${this.dir}`);
    }

    /**
     * Adds a listener on a specific client event(s).
     *
     * This method is abstract since the event depends on context
     * (ie. 'messageCreate' for prefix commands and 'interactionCreate' for slashCommands).
     */
    abstract addListener(): void;

    /**
     * Creates a Module class for the given file.
     *
     * This method is abstract since the class type depends on context
     * (ie. EventModule/SlashCommandModule etc.)
     * which can take different parameters.
     */
    abstract createModule(filename: string, module: BotlyModule<T>): M;
}
