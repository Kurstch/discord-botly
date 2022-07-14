import PrefixCommandModule from '../../src/modules/PrefixCommandModule';
import dummyManager from '../mock/dummyManager';
import type { BotlyModule } from '../../typings';
import type PrefixCommandModuleManager from '../../src/moduleManagers/PrefixCommandModuleManager';

const dm = dummyManager as PrefixCommandModuleManager;

describe('Testing PrefixCommandModule', () => {
    describe('testing matches method', () => {
        it('should return true', () => {
            const module1 = new PrefixCommandModule(dm, 'test.js', {
                aliases: ['tst', 't'],
                execute: () => { },
            });

            expect(module1.matches({ content: '!test' } as any, '!')).toBe(true);
            expect(module1.matches({ content: '!tst' } as any, '!')).toBe(true);
            expect(module1.matches({ content: '!t' } as any, '!')).toBe(true);
        });

        it('should return false', () => {
            const module1 = new PrefixCommandModule(dm, 'test.js', {
                execute: () => { },
            });

            expect(module1.matches({ content: 'test' } as any, '!')).toBe(false);
            expect(module1.matches({ content: '!invalid' } as any, '!')).toBe(false);
        });
    })

    describe('Testing validateCommandData method', () => {
        const execute = () => { };

        const validDescription = { execute, description: '' };
        const validSyntax = { execute, syntax: '' };
        const validCategory = { execute, category: '' };

        const invalidDescription = { execute, description: 0 } as unknown as BotlyModule<any>;
        const invalidSyntax = { execute, syntax: 0 } as unknown as BotlyModule<any>;
        const invalidCategory = { execute, category: 0 } as unknown as BotlyModule<any>;

        it('should not throw', () => {
            expect(() => new PrefixCommandModule(dm, 'someName.js', validDescription)).not.toThrowError();
            expect(() => new PrefixCommandModule(dm, 'someName.js', validSyntax)).not.toThrowError();
            expect(() => new PrefixCommandModule(dm, 'someName.js', validCategory)).not.toThrowError();
        });

        it('should throw error', () => {
            expect(() =>
                new PrefixCommandModule(dm, 'someName.js', invalidDescription)
            ).toThrowError();
            expect(() => new PrefixCommandModule(dm, 'someName.js', invalidSyntax)).toThrowError();
            expect(() => new PrefixCommandModule(dm, 'someName.js', invalidCategory)).toThrowError();
        });
    });
});
