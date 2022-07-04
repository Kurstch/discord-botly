import SlashCommandModule from '../../src/modules/SlashCommandModule';
import dummyManager from '../mock/dummyManager';
import type { CommandData } from '../../typings';
import type SlashCommandModuleManager from '../../src/moduleManagers/SlashCommandModuleManager';

const dm = dummyManager as SlashCommandModuleManager;

describe('Testing SlashCommandModule', () => {
    const commandData = {
        name: 'test',
        description: 'test',
    } as CommandData;

    describe('Testing validateCommandData method', () => {
        const file = { execute: () => { } } as any;

        it('should throw error if commandData is not an object', () => {
            expect(() => {
                new SlashCommandModule(dm, 'commandData' as any, 'test.js', file);
            }).toThrow();
        });

        it('should pass', () => {
            expect(() => {
                new SlashCommandModule(dm, commandData, 'test.js', file);
            }).not.toThrow();
        });
    });

    describe('Testing matches method', () => {
        const module = new SlashCommandModule(dm, commandData, 'test.js', { commandData, execute: () => { } });

        it('should return true', () => {
            expect(module.matches({ commandName: 'test' } as any)).toBe(true);
        });

        it('should return false', () => {
            expect(module.matches({ commandName: 'invalid' } as any)).toBe(false);
        });
    });
});
