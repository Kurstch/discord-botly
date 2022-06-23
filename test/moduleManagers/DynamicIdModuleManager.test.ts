import { EventEmitter } from 'events';
import path from 'path';

import DynamicIdModuleManager from '../../src/moduleManagers/DynamicIdModuleManager';
import DynamicIdModule from '../../src/modules/DynamicIdModule';

const dirPath = path.join(__dirname, '../mock/buttons');

function createManager() {
    return new DynamicIdModuleManager(
        new EventEmitter() as any,
        dirPath
    );
}

const addListenerSpy = jest.spyOn(DynamicIdModuleManager.prototype, 'addListener');
const createModuleSpy = jest.spyOn(DynamicIdModuleManager.prototype, 'createModule');
const matchesSpy = jest.spyOn(DynamicIdModule.prototype, 'matches');
const listenerSpy = jest.spyOn(DynamicIdModule.prototype, 'listener');
const fakeInteraction = {
    isButton: () => true,
    isSelectMenu: () => false,
    customId: 'button',
    reply: () => { }
} as any;

describe('Testing DynamicIdModuleManager', () => {
    afterEach(() => jest.clearAllMocks());

    it('should add listener to client', () => {
        const manager = createManager();

        expect(addListenerSpy).toHaveBeenCalled();
        expect(manager.client.listeners('interactionCreate').length).toBe(1);
    });

    it('should create module', () => {
        const manager = createManager();

        expect(createModuleSpy).toHaveBeenCalled();
        expect(manager.modules.length).toBe(1);
        expect(manager.modules[0]).toBeInstanceOf(DynamicIdModule);
    });


    it('should call matches on module', () => {
        const manager = createManager();
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));

        callback(fakeInteraction);

        expect(matchesSpy).toHaveBeenCalled();
        expect(matchesSpy).toHaveBeenCalledWith(fakeInteraction);
    });

    it('should call listener', () => {
        const manager = createManager();
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));

        callback(fakeInteraction);

        expect(listenerSpy).toHaveBeenCalled();
        expect(listenerSpy).toHaveBeenCalledWith(fakeInteraction);

    });

    it(`should not call listener if id doesn't match`, () => {
        const manager = createManager();
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));
        const localFakeInteraction = fakeInteraction;
        localFakeInteraction.customId = 'wrong-id';

        callback(fakeInteraction);

        expect(matchesSpy).toHaveBeenCalled();
        expect(listenerSpy).not.toHaveBeenCalled();
    });

    it('should return if interaction is instanceof ButtonInteraction or SelectMenuInteraction', () => {
        const manager = createManager();
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));
        const localFakeInteraction = fakeInteraction;
        localFakeInteraction.isButton = () => false;

        callback(localFakeInteraction);

        expect(addListenerSpy).toReturnWith(undefined);
    });
});
