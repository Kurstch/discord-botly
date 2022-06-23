import { Message } from 'discord.js';
import BaseModule from '../../src/modules/BaseModule';

import type { BotlyModule, FuncParams, ModuleTypes } from '../../typings';

// Because BaseModule is and abstract class, we can't test it directly.
// Instead, we'll create a subclass and test that.
class DummyBaseModule<T extends ModuleTypes> extends BaseModule<T> {
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
        const testModule = new DummyBaseModule('name.js', { execute, filter, filterCallback });

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
            expect(() => new DummyBaseModule('test.js', moduleWithExecute)).not.toThrow();
            expect(() => new DummyBaseModule('test.js', moduleWithFilter)).not.toThrow();
            expect(() => new DummyBaseModule('test.js', moduleWithFilterCallback)).not.toThrow();
        });

        it('should throw error when validating', () => {
            expect(() => new DummyBaseModule('test.js', invalidExecute)).toThrowError();
            expect(() => new DummyBaseModule('test.js', invalidFilter)).toThrowError();
            expect(() => new DummyBaseModule('test.js', invalidFilterCallback)).toThrowError();
        });
    });

    describe('Testing passesFilterIfExists method', () => {
        const noFilterModule = new DummyBaseModule('test.js', { execute: () => { } });
        let filterModule: DummyBaseModule<Message>;

        beforeEach(() => {
            filterModule = new DummyBaseModule('test.js', {
                execute: () => { },
                filter: (_, args) => !!args.length,
            });
        });

        it('should pass filter', async () => {
            expect(await noFilterModule.test_passesFilterIfExists()).toBe(true);
            expect(await filterModule.test_passesFilterIfExists({} as any, [''])).toBe(true);
        });

        it('should fail filter', async () => {
            expect(await filterModule.test_passesFilterIfExists({} as any, [])).toBe(false);
        });
    });

    it('should call filter callback if it exists', async () => {
        const callback = jest.fn();
        const moduleWithoutCallback = new DummyBaseModule<Message>('test.js', { execute: () => { } });
        const moduleWithCallback = new DummyBaseModule<Message>('test.js', {
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
            const testModule = new DummyBaseModule<Message>('test.js', {
                execute: () => { },
                filter: callback,
            });

            await testModule.listener({} as any, ['']);
            expect(callback).toHaveBeenCalled();
        });

        it('call execute from listener', async () => {
            const testModule = new DummyBaseModule<Message>('test.js', { execute: callback });

            await testModule.listener({} as any, ['']);
            expect(callback).toHaveBeenCalled();
        });

        it('call execute from listener', async () => {
            const testModule = new DummyBaseModule<Message>('test.js', {
                execute: () => { },
                filter: () => false,
                filterCallback: callback,
            });

            await testModule.listener({} as any, ['']);
            expect(callback).toHaveBeenCalled();
        });
    });
});
