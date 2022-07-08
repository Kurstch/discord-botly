import { Collection, Message } from 'discord.js';
import BaseModule from '../../src/modules/BaseModule';
import dummyManager from '../mock/dummyManager';
import type { BotlyModule, FuncParams, ModuleTypes } from '../../typings';
import type BaseManager from '../../src/moduleManagers/BaseManager';
import type PrefixCommandModule from '../../src/modules/PrefixCommandModule';

// Because BaseModule is and abstract class, we can't test it directly.
// Instead, we'll create a subclass and test that.
class DummyBaseModule<T extends ModuleTypes> extends BaseModule<T, any> {
    // This method is only defined because it's an abstract method.
    // It's not actually used in the test.
    // @ts-ignore
    matches(...args: any[]): boolean { return true; }

    // Because protected methods and properties are only accessible within
    // the class they're defined in, we can't test them directly.
    // Instead, we'll create methods to use in tests.

    test_matchProperties(execute: Function, filter: Function, filterCallback: Function): boolean {
        return (
            this.execute === execute &&
            this.filter === filter &&
            this.filterCallback === filterCallback
        );
    };

    async test_passesFilterIfExists(...args: FuncParams<T>): Promise<boolean> {
        return await this.passesFilterIfExists(...args);
    }

    async test_callFilterCallbackIfExists(...args: FuncParams<T>): Promise<void> {
        await this.callFilterCallbackIfExists(...args);
    }
}

describe('Testing BaseModule', () => {
    it('should create module and set properties', () => {
        const execute = () => { };
        const filter = () => true;
        const filterCallback = () => { };
        const testModule = new DummyBaseModule(dummyManager, 'name.js', { execute, filter, filterCallback });

        expect(testModule).toBeDefined();
        expect(testModule.filename).toBe('name.js');
        expect(testModule.filenameWithoutExt).toBe('name');
        expect(testModule.test_matchProperties(execute, filter, filterCallback)).toBe(true);
    });

    describe('Testing validate method', () => {
        const moduleWithExecute: BotlyModule<any> = { execute: () => { } };
        const moduleWithFilter: BotlyModule<any> = { execute: () => { }, filter: () => true };
        const moduleWithFilterCallback: BotlyModule<any> = { execute: () => { }, filterCallback: () => { } };

        const invalidExecute = { execute: '' } as unknown as BotlyModule<any>;
        const invalidFilter = { filter: '' } as unknown as BotlyModule<any>;
        const invalidFilterCallback = { filterCallback: '' } as unknown as BotlyModule<any>;

        it('should validate', () => {
            expect(() => new DummyBaseModule(dummyManager, 'test.js', moduleWithExecute)).not.toThrow();
            expect(() => new DummyBaseModule(dummyManager, 'test.js', moduleWithFilter)).not.toThrow();
            expect(() => new DummyBaseModule(dummyManager, 'test.js', moduleWithFilterCallback)).not.toThrow();
        });

        it('should throw error when validating', () => {
            expect(() => new DummyBaseModule(dummyManager, 'test.js', invalidExecute)).toThrowError();
            expect(() => new DummyBaseModule(dummyManager, 'test.js', invalidFilter)).toThrowError();
            expect(() => new DummyBaseModule(dummyManager, 'test.js', invalidFilterCallback)).toThrowError();
        });
    });

    describe('Testing passesFilterIfExists method', () => {
        const noFilterModule = new DummyBaseModule(dummyManager, 'root/test/test.js', { execute: () => { } });
        let filterModule: DummyBaseModule<Message>;

        beforeEach(() => {
            filterModule = new DummyBaseModule(dummyManager, 'root/test/test.js', {
                execute: () => { },
                filter: (_, args) => !!args.length,
            });
        });

        it('should pass when there is no filter', async () => {
            const manager = { ...dummyManager };
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });
            expect(await module.test_passesFilterIfExists()).toBe(true);

            // Will be dropped in v2.0.0
            expect(await noFilterModule.test_passesFilterIfExists()).toBe(true);
        });

        it('should pass when there is a filter', async () => {
            const manager = { ...dummyManager };
            manager.filters.set('root/test/__filter.js', () => true);
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });

            expect(await module.test_passesFilterIfExists()).toBe(true);

            // Will be dropped in v2.0.0
            expect(await filterModule.test_passesFilterIfExists({} as any, [''])).toBe(true);
        });

        it('should fail filter', async () => {
            const manager = { ...dummyManager };
            manager.filters.set('root/__filter.js', () => false);
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });

            expect(await module.test_passesFilterIfExists()).toBe(false);

            // Will be dropped in v2.0.0
            expect(await filterModule.test_passesFilterIfExists({} as any, [])).toBe(false);
        });
    });

    it('should call filter callback if it exists', async () => {
        const callback = jest.fn();
        const moduleWithoutCallback = new DummyBaseModule<Message>({} as any, 'test.js', { execute: () => { } });
        const moduleWithCallback = new DummyBaseModule<Message>({} as any, 'test.js', {
            execute: () => { },
            filterCallback: callback,
        });

        await moduleWithCallback.test_callFilterCallbackIfExists({} as any, ['']);
        expect(await moduleWithoutCallback.test_callFilterCallbackIfExists({} as any, [''])).toBe(undefined);
        expect(callback).toHaveBeenCalled();
    });

    describe('Testing listener method', () => {
        let callback: jest.Mock;

        beforeEach(() => {
            callback = jest.fn();
        });

        it('call passesFilterIfExists from listener', async () => {
            const testModule = new DummyBaseModule<Message>(dummyManager, 'test.js', {
                execute: () => { },
                filter: callback,
            });

            await testModule.listener({} as any, ['']);
            expect(callback).toHaveBeenCalled();
        });

        it('call execute from listener', async () => {
            const testModule = new DummyBaseModule<Message>(dummyManager, 'test.js', { execute: callback });

            await testModule.listener({} as any, ['']);
            expect(callback).toHaveBeenCalled();
        });

        it('call execute from listener', async () => {
            const testModule = new DummyBaseModule<Message>(dummyManager, 'test.js', {
                execute: () => { },
                filter: () => false,
                filterCallback: callback,
            });

            await testModule.listener({} as any, ['']);
            expect(callback).toHaveBeenCalled();
        });

        describe('testing error catching', () => {
            const catcher = jest.fn();
            const error = new Error();
            let testModule: DummyBaseModule<Message>;
            const call = async () => await testModule.listener({} as Message, []);

            beforeEach(() => {
                jest.clearAllMocks();
                const manager = { filters: new Collection(), catchers: new Collection() } as BaseManager<Message, PrefixCommandModule>;
                testModule = new DummyBaseModule(manager, 'root/test.js', {
                    execute: () => { throw error; }
                });
            });

            it('should catch error', async () => {
                testModule.manager.catchers.set('root/__catch.js', catcher);
                await call();
                expect(catcher).toBeCalledWith(error, {}, []);
            });

            it('should not catch error when there is a catcher', async () => {
                testModule.manager.catchers.set('root/sub-dir/__catch.js', catcher);
                await expect(call()).rejects.toThrowError(error);
            });

            it('should not catch error when there is not a catcher', async () => {
                await expect(call()).rejects.toThrowError(error);
            });
        });
    });
});
