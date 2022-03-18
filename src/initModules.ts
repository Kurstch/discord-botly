import { Collection, CommandInteraction, SelectMenuInteraction } from "discord.js";
import path from 'path';
import fs from 'fs';
import { registerId } from "./utils/dynamicId";
import type { BotlyModule, ModuleData, ModuleTypes } from "../typings";

type Type = 'event'
    | 'prefix command'
    | 'slash command'
    | 'button interaction'
    | 'select menu interaction';

export default function initModules<T extends ModuleTypes>(type: Type, dir: string): Collection<string, ModuleData<T>> {
    const store: Collection<string, ModuleData<T>> = new Collection();
    const files = getFiles(dir);
    const errors: string[] = [];

    console.group(`\nInitializing ${type}s:`);

    for (const { filepath, filename } of files) {
        const module = require(filepath) as BotlyModule<T>;
        const err = validateModule<T>(type, filename, module);

        if (err.length) {
            errors.push(...err);
            continue;
        }

        //@ts-ignore
        const moduleData: ModuleData<T> = module;

        if (type === 'button interaction' || type === 'select menu interaction') {
            const res = registerId(filename.split('.js')[0]);
            if (res instanceof Error) {
                errors.push(res.message);
                continue;
            }
            (<ModuleData<SelectMenuInteraction>>moduleData).customId = res.customId;
            (<ModuleData<SelectMenuInteraction>>moduleData).regexp = res.regexp;
            (<ModuleData<SelectMenuInteraction>>moduleData).params = res.params;
        }

        store.set(filename.split('.js')[0], moduleData);
    }

    if (store.size > 0) console.log(`Successfully initialized ${store.size} ${type}(s)`);
    if (errors.length) {
        console.group(`Failed to initialize ${errors.length} ${type}(s):`);
        errors.forEach(error => console.error(error));
        console.groupEnd();
    }
    console.groupEnd();

    return store;
}

/**
 * Reads the directory and recursively finds all .js files
 * inside it and its sub-directories.
 */
function getFiles(dir: string): Array<{ filepath: string, filename: string; }> {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const results = [];

    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);

        if (dirent.isDirectory()) {
            results.push(...getFiles(path.resolve(dir, dirent.name)));
        } else if (dirent.name.endsWith('.js')) {
            results.push({
                filepath: res,
                filename: dirent.name,
            });
        }
    }

    return results;
}

function validateModule<T extends ModuleTypes>(type: Type, file: string, module: BotlyModule<T>): string[] {
    const errors: string[] = [];

    if (type === 'slash command' && typeof (<BotlyModule<CommandInteraction>>module).commandData !== "object")
        errors.push(`${file}: exports.commandData must be an object`);

    if (typeof module.execute !== 'function')
        errors.push(`${file}: exports.execute must be a function`);

    if (module.filter && typeof module.filter !== 'function')
        errors.push(`${file}: exports.filter must be either undefined or a function`);

    if (module.filterCallback && typeof module.filterCallback !== 'function')
        errors.push(`${file}: exports.filterCallback must be either undefined or a function`);

    return errors;
}
