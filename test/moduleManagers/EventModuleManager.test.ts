import EventModuleManager from '../../src/moduleManagers/EventModuleManager';
import EventModule from '../../src/modules/EventModule';
import { EventEmitter } from 'events';
import path from 'path';

const dirPath = path.join(__dirname, '../mock/events');
const addListenerSpy = jest.spyOn(EventModuleManager.prototype as any, 'addListener');
const createModuleSpy = jest.spyOn(EventModuleManager.prototype as any, 'createModule');
const listenerSpy = jest.spyOn(EventModule.prototype, 'listener');

function createManager() {
    return new EventModuleManager(
        new EventEmitter() as any,
        dirPath
    );
}

describe('Testing EventModuleManager', () => {
    afterEach(() => jest.clearAllMocks());

    it('should add listeners for every file', () => {
        const manager = createManager();

        expect(addListenerSpy).toHaveBeenCalled();
        expect(manager.client.eventNames().length).toBe(2)
        expect(manager.client.listeners('ready').length).toBe(1)
        expect(manager.client.listeners('guildMemberAdd').length).toBe(1)
    });

    it('should call listener on event emitted', () => {
        const manager = createManager();
        const callback = jest.fn((i: any) => manager.client.listeners('guildMemberAdd')[0](i));

        callback({});

        expect(listenerSpy).toHaveBeenCalled();
        expect(listenerSpy).toHaveBeenCalledWith({});
    })

    it('should create module', () => {
        const manager = createManager();

        expect(createModuleSpy).toHaveBeenCalledTimes(2);
        expect(manager.modules.length).toBe(2)
        expect(manager.modules[0]).toBeInstanceOf(EventModule)
        expect(manager.modules[1]).toBeInstanceOf(EventModule)
    })
});
