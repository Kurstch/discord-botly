import path from 'path';
import type { ClientEvents } from 'discord.js';
import type { BotlyModule, FuncParams, ModuleTypes } from '../../typings';
import type DynamicIdModuleManager from '../moduleManagers/DynamicIdModuleManager';
import type EventModuleManager from '../moduleManagers/EventModuleManager';
import type PrefixCommandModuleManager from '../moduleManagers/PrefixCommandModuleManager';
import type SlashCommandModuleManager from '../moduleManagers/SlashCommandModuleManager';

type ManagerClassType = PrefixCommandModuleManager
    | DynamicIdModuleManager
    | SlashCommandModuleManager
    | EventModuleManager<keyof ClientEvents>

export default abstract class BaseModule<
    T extends ModuleTypes,
    M extends ManagerClassType,
    P extends FuncParams<T> = FuncParams<T>>
{
    // The args type is set as `any[]` rather than `FuncParams<T>`
    // because the latter causes massive slowdowns when editing in an IDE
    // no idea why ¯\_(ツ)_/¯
    /* eslint-disable @typescript-eslint/no-explicit-any */
    protected readonly execute: (...args: any[]) => Promise<void> | void;
    readonly filepath: string;
    readonly filename: string;
    readonly filenameWithoutExt: string;

    readonly manager: M;

    constructor(manager: M, filepath: string, file: BotlyModule<T>) {
        this.execute = file.execute;
        this.filepath = filepath;
        this.filename = path.basename(filepath);
        this.filenameWithoutExt = this.filename.split('.js')[0];
        this.manager = manager;

        this.validate();
    }

    /**
     * The callback function which is passed
     * to the Discord.Client event listener.
     *
     * Can be overridden if the listener requires more additional logic.
     *
     * @example
     * client.on(eventName, module.listener);
     */
    async listener(...args: P): Promise<void> {
        // Wrap the needed calls so as to not repeat the same code twice
        const run = async () => {
            if (await this.passesFilterIfExists(...args))
                await this.execute(...args);
        };

        // If there are no catch modules or if none of the existing catch modules
        // can be applied to this module, then do not use try/catch.
        const moduleDirpath = path.dirname(this.filepath);
        const hasCatchers = [...this.manager.catchers.keys()]
            .some(key => moduleDirpath.includes(path.dirname(key)));

        if (hasCatchers) await run()
            .catch(error => this.handleError(error, ...args));
        else await run();
    }

    private handleError(error: unknown, ...args: P): void {
        const moduleDirpath = path.dirname(this.filepath);

        for (const [filepath, catcherModule] of this.manager.catchers) {
            const catchDirpath = path.dirname(filepath);
            if (!moduleDirpath.includes(catchDirpath)) continue;
            // @ts-expect-error - For some reason the type for catchModule is messed up, so it doesn't want to accept args.
            catcherModule(error, ...args);
        }
    }

    /**
     * Check all of the filters for the ModuleManager
     * and find the ones that are "on the way" to this module.
     *
     * Because a module may have multiple filters.
     *
     * eg. `prefixCommands/admin/ban.ts`
     * may have the filters:
     * - prefixCommands/__filter.ts
     * - prefixCommands/admin/filter.ts
     */
    protected async passesFilterIfExists(...args: P): Promise<boolean> {
        const moduleDirpath = path.dirname(this.filepath);

        for (const [filepath, filter] of this.manager.filters) {
            const filterDirpath = path.dirname(filepath);
            if (!moduleDirpath.includes(filterDirpath)) continue;

            // @ts-expect-error - For some reason the type for filter is messed up, so it doesn't want to accept args.
            const passesFilter = await filter(...args);

            if (passesFilter) continue;
            else return false;
        }

        return true;
    }

    private validate(): void {
        if (typeof this.execute !== 'function')
            throw new Error(`${this.filename}: exports.execute must be a function`);
    }

    /**
     * Used for finding the right module out of many.
     *
     * This method is abstract since the matching logic is different
     * for each module type and should be implemented separately.
     *
     * @example
     * const module = modules.find(module => module.matches(...args));
     */
    abstract matches(param: T, ...args: unknown[]): boolean;
}
