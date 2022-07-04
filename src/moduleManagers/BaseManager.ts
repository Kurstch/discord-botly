import path from 'path';
import walkdir from 'walkdir';
import { Collection } from 'discord.js';
import type { Client } from 'discord.js';
import type { FilterFunction, BotlyModule, ModuleTypes } from '../../typings';
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
    modules: M[] = [];
    filters = new Collection<string, FilterFunction<T>>();
    dir: string;

    constructor(client: Client, dir: string) {
        this.client = client;
        this.dir = dir;

        this.importModules();
        this.addListener();
        this.logResults();
    }

    private readDir(dir: string): string[] {
        return walkdir.sync(dir)
            .filter(filename => filename.endsWith('.js'));
    }

    /**
     * Imports all modules from `this.dir` as modules/filters
     */
    private importModules(): void {
        const files = this.readDir(this.dir);

        for (const filepath of files) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const module = require(filepath);
            const basename = path.basename(filepath);
            const isRegularModule = !basename.startsWith('__');
            const isFilter = basename.startsWith('__filter');

            if (isRegularModule)
                this.modules.push(this.createModule(filepath, module));
            else if (isFilter) {
                this.validateFilterModule(filepath, module);
                this.filters.set(filepath, module.default);
            }
        }
    }

    private validateFilterModule(filepath: string, module: { default: FilterFunction<T>; }): void {
        if (!module.default || typeof module.default !== 'function')
            throw new Error(`${filepath}: default export must be a function`);
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
    abstract createModule(filepath: string, module: BotlyModule<T>): M;
}
