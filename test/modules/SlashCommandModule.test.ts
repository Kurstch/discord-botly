import SlashCommandModule from '../../src/modules/SlashCommandModule';
import type { CommandData } from '../../typings';

describe('Testing SlashCommandModule', () => {
    const commandData = {
        name: 'test',
        description: 'test',
    } as CommandData;

    describe('Testing validateCommandData method', () => {
        const file = { execute: () => { } } as any;

        it('should throw error if commandData is not an object', () => {
            expect(() => {
                new SlashCommandModule('commandData' as any, 'test.js', file);
            }).toThrow();
        });

        it('should pass', () => {
            expect(() => {
                new SlashCommandModule(commandData, 'test.js', file);
            }).not.toThrow();
        });
    });

    describe('Testing matches method', () => {
        const module = new SlashCommandModule(commandData, 'test.js', { commandData, execute: () => { } });

        it('should return true', () => {
            expect(module.matches({ commandName: 'test' } as any)).toBe(true);
        });

        it('should return false', () => {
            expect(module.matches({ commandName: 'invalid' } as any)).toBe(false);
        });
    });
});
