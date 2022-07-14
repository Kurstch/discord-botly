import { Collection, Message } from 'discord.js';
import BaseModule from '../../src/modules/BaseModule';
import dummyManager from '../mock/dummyManager';
import type { FuncParams, ModuleTypes } from '../../typings';
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

    test_matchProperties(execute: Function): boolean {
        return (
            this.execute === execute
        );
    };

    async test_passesFilterIfExists(...args: FuncParams<T>): Promise<boolean> {
        return await this.passesFilterIfExists(...args);
    }
}

describe('Testing BaseModule', () => {
    it('should create module and set properties', () => {
        const execute = () => { };
        const testModule = new DummyBaseModule(dummyManager, 'name.js', { execute });

        expect(testModule).toBeDefined();
        expect(testModule.filename).toBe('name.js');
        expect(testModule.filenameWithoutExt).toBe('name');
        expect(testModule.test_matchProperties(execute)).toBe(true);
    });

    describe('Testing validate method', () => {
        it('should validate', () => {
            expect(() => new DummyBaseModule(dummyManager, 'test.js', { execute: () => { } })).not.toThrow();
        });

        it('should throw error when validating', () => {
            expect(() => new DummyBaseModule(dummyManager, 'test.js', { execute: undefined } as any)).toThrowError();
        });
    });

    describe('Testing passesFilterIfExists method', () => {
        it('should pass when there is no filter', async () => {
            const manager = { ...dummyManager };
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });
            expect(await module.test_passesFilterIfExists()).toBe(true);
        });

        it('should pass when there is a filter', async () => {
            const manager = { ...dummyManager };
            manager.filters.set('root/test/__filter.js', () => true);
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });

            expect(await module.test_passesFilterIfExists()).toBe(true);
        });

        it('should pass when there is a filter but doesn\'t apply', async () => {
            const manager = { ...dummyManager };
            manager.filters.set('root/other_path/__filter.js', () => false);
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });

            expect(await module.test_passesFilterIfExists()).toBe(true);
        });

        it('should fail filter', async () => {
            const manager = { ...dummyManager };
            manager.filters.set('root/__filter.js', () => false);
            const module = new DummyBaseModule(manager, 'root/test/test.js', { execute: () => { } });

            expect(await module.test_passesFilterIfExists()).toBe(false);
        });
    });

    describe('Testing listener method', () => {
        it('call passesFilterIfExists from listener', async () => {
            const spy = jest.spyOn(DummyBaseModule.prototype as any, 'passesFilterIfExists');
            const testModule = new DummyBaseModule<Message>(dummyManager, 'test.js', { execute: () => { } });
            await testModule.listener({} as any, ['']);
            expect(spy).toHaveBeenCalled();
        });

        it('call execute from listener', async () => {
            const execute = jest.fn();
            const testModule = new DummyBaseModule<Message>(dummyManager, 'test.js', { execute });
            await testModule.listener({} as any, ['']);
            expect(execute).toHaveBeenCalled();
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
