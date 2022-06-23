import SlashCommandModuleManager from '../../src/moduleManagers/SlashCommandModuleManager';
import SlashCommandModule from '../../src/modules/SlashCommandModule';
import { EventEmitter } from 'events';
import path from 'path';

const matchesSpy = jest.spyOn(SlashCommandModule.prototype, 'matches');
const listenerSpy = jest.spyOn(SlashCommandModule.prototype, 'listener');

function createManager() {
    return new SlashCommandModuleManager(
        new EventEmitter() as any,
        path.join(__dirname, '../mock/commands')
    );
}

describe('Testing SlashCommandModuleManager', () => {
    it('should add listener to "interactionCreate" event', () => {
        const manager = createManager();

        expect(manager.client.eventNames().length).toBe(1);
        expect(manager.client.listeners('interactionCreate').length).toBe(1);
    });

    it('should return if interaction.isCommand() is false', () => {
        const manager = createManager();
        const interaction = { isCommand: () => false };
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));

        callback(interaction);

        expect(callback).toHaveReturnedWith(undefined);
        expect(matchesSpy).not.toHaveBeenCalled();
        expect(listenerSpy).not.toHaveBeenCalled();
    });

    it('should call matches', () => {
        const manager = createManager();
        const interaction = { isCommand: () => true, commandName: 'ping', reply: () => { } };
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));

        callback(interaction);

        expect(matchesSpy).toHaveBeenCalled();
        expect(matchesSpy).toHaveBeenCalledWith(interaction);
    });

    it('should call listener', () => {
        const manager = createManager();
        const interaction = { isCommand: () => true, commandName: 'ping', reply: () => { } };
        const callback = jest.fn((i: any) => manager.client.listeners('interactionCreate')[0](i));

        callback(interaction);

        expect(listenerSpy).toHaveBeenCalled();
        expect(listenerSpy).toHaveBeenCalledWith(interaction);
    });

    it('should create module', () => {
        const manager = createManager();

        expect(manager.modules.length).toBe(2);
        expect(manager.modules[0]).toBeInstanceOf(SlashCommandModule);
        expect(manager.modules[1]).toBeInstanceOf(SlashCommandModule);
    });
});
