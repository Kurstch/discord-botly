import type { BotlyModule, FuncParams, ModuleTypes } from '../../typings';

export default abstract class BaseModule<
    T extends ModuleTypes,
    P extends FuncParams<T> = FuncParams<T>>
{
    // The args type is set as `any[]` rather than `FuncParams<T>`
    // because the latter causes massive slowdowns when editing in an IDE
    // no idea why ¯\_(ツ)_/¯
    protected readonly execute: (...args: any[]) => void;
    protected readonly filter?: (...args: any[]) => Promise<boolean> | boolean;
    protected readonly filterCallback?: (...args: any[]) => void;

    readonly filename: string;
    readonly filenameWithoutExt: string;

    constructor(filename: string, file: BotlyModule<T>) {
        this.execute = file.execute;
        this.filter = file.filter;
        this.filterCallback = file.filterCallback;

        this.filename = filename;
        this.filenameWithoutExt = filename.split('.js')[0];

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
        if (await this.passesFilterIfExists(...args)) this.execute(...args);
        else this.callFilterCallbackIfExists(...args);
    }

    protected async passesFilterIfExists(...args: P): Promise<boolean> {
        if (!this.filter) return true;
        if (await this.filter(...args)) return true;
        return false;
    }

    protected async callFilterCallbackIfExists(...args: P): Promise<void> {
        if (!this.filterCallback) return;
        this.filterCallback(...args);
    }

    private validate(): void {
        if (typeof this.execute !== 'function')
            throw new Error(`${this.filename}: exports.execute must be a function`);
        if (this.filter && typeof this.filter !== 'function')
            throw new Error(`${this.filename}: exports.filter must be undefined or a function`);
        if (this.filterCallback && typeof this.filterCallback !== 'function')
            throw new Error(`${this.filename} exports.filterCallback must be undefined or a function`);
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
    abstract matches(param: T): boolean;
}
