import PrefixCommandModuleManager from '../../src/moduleManagers/PrefixCommandModuleManager';
import PrefixCommandModule from '../../src/modules/PrefixCommandModule';
import { EventEmitter } from 'events';
import path from 'path';

const dirPath = path.join(__dirname, '../mock/prefixCommands');
const createModuleSpy = jest.spyOn(PrefixCommandModuleManager.prototype, 'createModule');
const addListenerSpy = jest.spyOn(PrefixCommandModuleManager.prototype, 'addListener');
const listenerSpy = jest.spyOn(PrefixCommandModule.prototype, 'listener');
const matchSpy = jest.spyOn(PrefixCommandModule.prototype, 'matches');

function createManager() {
    return new PrefixCommandModuleManager(
        '!',
        new EventEmitter() as any,
        dirPath
    );
}

describe('Testing PrefixCommandModuleManager', () => {
    afterEach(() => jest.clearAllMocks());

    it('should add listener to "messageCreate" event', () => {
        const manager = createManager();

        expect(addListenerSpy).toHaveBeenCalled();
        expect(manager.client.listeners('messageCreate').length).toBe(1);
    });

    it('should call matches', () => {
        const manager = createManager();
        const message = { content: '!ping' };
        const callback = jest.fn((m: any) => manager.client.listeners('messageCreate')[0](m));

        callback(message);

        expect(matchSpy).toHaveBeenCalledWith(message);
        expect(matchSpy).toBeCalledTimes(2);
    });

    it('should call listener', () => {
        const manager = createManager();
        const message = { content: '!ping' };
        const callback = jest.fn((m: any) => manager.client.listeners('messageCreate')[0](m));

        callback(message);

        expect(listenerSpy).toHaveBeenCalledTimes(1);
        expect(listenerSpy).toHaveBeenCalledWith(message);
    });

    it('should create module', () => {
        const manager = createManager();

        expect(createModuleSpy).toHaveBeenCalledTimes(2);
        expect(manager.modules.length).toBe(2);
        expect(manager.modules[0]).toBeInstanceOf(PrefixCommandModule);
        expect(manager.modules[1]).toBeInstanceOf(PrefixCommandModule);
    });

    it('should return prefix command data', () => {
        const manager = createManager();

        expect(manager.commandData).toContainEqual(
            { name: 'ping', description: 'Replies with `pong!`', syntax: 'ping', category: 'random' },
        );
        expect(manager.commandData).toContainEqual(
            { name: 'foo', description: undefined, syntax: undefined, category: undefined },
        );
    });
});
