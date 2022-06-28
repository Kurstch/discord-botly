import PrefixCommandModuleManager from '../../src/moduleManagers/PrefixCommandModuleManager';
import PrefixCommandModule from '../../src/modules/PrefixCommandModule';
import { EventEmitter } from 'events';
import path from 'path';
import type { Prefix } from '../../typings';
import type { Message } from 'discord.js';

const dirPath = path.join(__dirname, '../mock/prefixCommands');
const createModuleSpy = jest.spyOn(PrefixCommandModuleManager.prototype, 'createModule');
const addListenerSpy = jest.spyOn(PrefixCommandModuleManager.prototype, 'addListener');
const listenerSpy = jest.spyOn(PrefixCommandModule.prototype, 'listener');
const matchSpy = jest.spyOn(PrefixCommandModule.prototype, 'matches');

function createManager(prefix?: Prefix) {
    return new PrefixCommandModuleManager(
        prefix ?? '!',
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

    it('should call matches', async () => {
        const manager = createManager();
        const message = { content: '!ping' };
        const callback = manager.client.listeners('messageCreate')[0];

        await callback(message)

        expect(matchSpy).toHaveBeenCalledWith(message, '!');
        expect(matchSpy).toBeCalledTimes(2);
    });

    it('should call listener', async () => {
        const manager = createManager();
        const message = { content: '!ping' };
        const callback = manager.client.listeners('messageCreate')[0];

        await callback(message)

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
            { name: 'ping', description: 'Replies with `pong!`', syntax: 'ping', category: 'random', aliases: ['p'] },
        );
        expect(manager.commandData).toContainEqual(
            { name: 'foo', description: undefined, syntax: undefined, category: undefined, aliases: [] },
        );
    });

    describe('testing getPrefix method', () => {
        const getPrefixSpy = jest.spyOn(PrefixCommandModuleManager.prototype as any, 'getPrefix');
        const fakeMsg = { content: '' } as Message;
        afterEach(() => jest.clearAllMocks());

        it('should work when prefix is function', async () => {
            const prefix = async () => '!';
            const getPrefixImpl = getPrefixSpy.getMockImplementation()!.bind({ prefix });
            expect(await getPrefixImpl(fakeMsg)).toBe('!');
        });

        it('should work when prefix is string', async () => {
            const prefix = '!';
            const getPrefixImpl = getPrefixSpy.getMockImplementation()!.bind({ prefix });
            expect(await getPrefixImpl(fakeMsg)).toBe('!');
        });
    });
});
