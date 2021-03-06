import { ButtonInteraction } from 'discord.js';
import DynamicIdModule from '../../src/modules/DynamicIdModule';
import dummyManager from '../mock/dummyManager';
import type { BotlyModule } from '../../typings/index';
import type DynamicIdModuleManager from '../../src/moduleManagers/DynamicIdModuleManager';

const dm = dummyManager as DynamicIdModuleManager;

describe('Testing DynamicIdModule', () => {
    const moduleData: BotlyModule<ButtonInteraction> = {
        execute: () => { }
    };

    it('should create regexp and params', () => {
        const spy = jest.spyOn(DynamicIdModule.prototype as any, 'createRegexp');
        const createRegexp1 = spy.getMockImplementation()!
            .bind({ id: 'id-without-params' });
        const createRegexp2 = spy.getMockImplementation()!
            .bind({ id: 'id-with-params-[id]' });

        expect(createRegexp1()).toEqual({ regexp: /^id-without-params/, params: null });
        expect(createRegexp2()).toEqual({ regexp: /^id-with-params-(.+)/, params: ['id'] });
    });

    describe('Testing matches method', () => {
        it('should return true', () => {
            const module1 = new DynamicIdModule(dm, 'test.js', moduleData);
            const module2 = new DynamicIdModule(dm, 'test-[id].js', moduleData);

            expect(module1.matches({ customId: 'test' } as ButtonInteraction)).toBe(true);
            expect(module2.matches({ customId: 'test-1234' } as ButtonInteraction)).toBe(true);
        });

        it('should return false', () => {
            const module1 = new DynamicIdModule(dm, 'test.js', moduleData);
            const module2 = new DynamicIdModule(dm, 'test-[id].js', moduleData);

            expect(module1.matches({ customId: 'invalid' } as ButtonInteraction)).toBe(false);
            expect(module2.matches({ customId: 'test' } as ButtonInteraction)).toBe(false);
        });
    });

    describe('Testing listener method', () => {
        it('should call execute method', async () => {
            const callback = jest.fn();
            const module = new DynamicIdModule(dm, 'test.js', {
                execute: callback,
            });

            await module.listener({} as any, {});
            expect(callback).toHaveBeenCalled();
        });

        it('should call callFilterCallbackIfExists', async () => {
            const callback = jest.fn();
            const module = new DynamicIdModule(dm, 'test.js', {
                execute: () => { },
                filter: () => false,
                filterCallback: callback,
            });

            await module.listener({} as any, {});
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Testing validateId method', () => {
        it('should pass validation', () => {
            expect(
                () => new DynamicIdModule(dm, 'id-without-params.js', moduleData)
            ).not.toThrow();

            expect(
                () => new DynamicIdModule(dm, 'id-with-params-[id].js', moduleData)
            ).not.toThrow();
        });

        it('should fail validation', () => {
            expect(
                () => new DynamicIdModule(dm, 'id-with-duplicate-params-[id]-[id].js', moduleData)
            ).toThrow();
        });
    });

    describe('Testing getParams', () => {
        const spy = jest.spyOn(DynamicIdModule.prototype as any, 'getParams');
        const getParams = spy.getMockImplementation();

        it('should return empty object if no params', () => {
            const getParams1 = getParams!.bind({ params: null });
            const getParams2 = getParams!.bind({ params: [] });
            const fakeInteraction = { customId: 'id-without-params' } as ButtonInteraction;

            expect(getParams1(fakeInteraction)).toEqual({});
            expect(getParams2(fakeInteraction)).toEqual({});
        });

        it('should return object with params', () => {
            const getParams1 = getParams!.bind({ params: ['id'], regexp: /^id-with-params-(.+)/g });
            const fakeInteraction = { customId: 'id-with-params-1234' } as ButtonInteraction;

            expect(getParams1(fakeInteraction)).toEqual({ id: '1234' });
        });
    });
});
