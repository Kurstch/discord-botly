import fs from 'fs';
import path from 'path';
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
    // @ts-ignore
    | EventModule<T>>
{
    client: Client;
    modules: M[];
    dir: string;

    /**
     * @param otherParams parameters that should be set before importing and initializing all modules
     */
    constructor(client: Client, dir: string, otherParams?: { [key: string]: string; }) {
        // Sets properties used by subclass (such as `prefix`)
        // before modules are imported and initialized
        if (otherParams) Object
            .keys(otherParams)
            .forEach(param =>
                // @ts-expect-error
                this[param] = otherParams[param]
            );

        const files = this.readDir(dir);
        const modules = this.importModules(files);

        this.client = client;
        this.modules = modules;
        this.dir = dir;

        this.addListener();
        this.logResults();
    }

    /**
     * Recursively finds all javascript files in the given directory
     * and all of it's sub-directories
     */
    private readDir(dir: string): DirReadResult[] {
        const dirents = fs.readdirSync(dir, { withFileTypes: true });
        const files: DirReadResult[] = [];

        for (const dirent of dirents) {
            const res = path.resolve(dir, dirent.name);

            if (dirent.isDirectory())
                files.push(...this.readDir(res));
            else if (dirent.name.endsWith('.js'))
                files.push({
                    path: res,
                    name: dirent.name,
                });
        }

        return files;
    }

    private importModules(files: DirReadResult[]): M[] {
        return files.map(file => {
            const result = require(file.path);
            return this.createModule(file, result);
        });
    }

    /**
     * Console logs the results after all modules have been initialized
     * for the given directory.
     */
    private logResults(): void {
        const amount = this.modules.length;
        console.log(`> Successfully initialized ${amount} module(s) from ${this.dir}`);
    };

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
    abstract createModule(file: DirReadResult, module: BotlyModule<T>): M;
}
