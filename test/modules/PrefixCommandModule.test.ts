import PrefixCommandModule from '../../src/modules/PrefixCommandModule';
import type { BotlyModule } from '../../typings';

describe('Testing PrefixCommandModule', () => {
    describe('Testing listener method', () => {
        it('should call execute method with correct args', async () => {
            const execute = jest.fn();
            const module = new PrefixCommandModule('test.js', {
                execute,
            });

            await module.listener({ content: '!test 1234' } as any);
            expect(execute).toHaveBeenCalled();
            expect(execute).toHaveBeenCalledWith({ content: '!test 1234' } as any, ['1234']);
        });

        it('should call filterCallback method with correct args', async () => {
            const filterCallback = jest.fn();
            const module = new PrefixCommandModule('test.js', {
                execute: () => { },
                filter: () => false,
                filterCallback,
            });

            await module.listener({ content: '!test 1234' } as any);
            expect(filterCallback).toHaveBeenCalled();
            expect(filterCallback).toHaveBeenCalledWith({ content: '!test 1234' } as any, ['1234']);
        })
    });

    describe('testing matches method', () => {
        it('should return true', () => {
            const module1 = new PrefixCommandModule('test.js', {
                execute: () => { },
            });

            expect(module1.matches({ content: '!test' } as any, '!')).toBe(true);
        });

        it('should return false', () => {
            const module1 = new PrefixCommandModule('test.js', {
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
            expect(() => new PrefixCommandModule('someName.js', validDescription)).not.toThrowError();
            expect(() => new PrefixCommandModule('someName.js', validSyntax)).not.toThrowError();
            expect(() => new PrefixCommandModule('someName.js', validCategory)).not.toThrowError();
        });

        it('should throw error', () => {
            expect(() =>
                new PrefixCommandModule('someName.js', invalidDescription)
            ).toThrowError();
            expect(() => new PrefixCommandModule('someName.js', invalidSyntax)).toThrowError();
            expect(() => new PrefixCommandModule('someName.js', invalidCategory)).toThrowError();
        });
    });
});
