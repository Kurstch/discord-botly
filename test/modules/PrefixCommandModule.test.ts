import PrefixCommandModule from '../../src/modules/PrefixCommandModule';

describe('Testing PrefixCommandModule', () => {
    it('should create prefix parameter', () => {
        const module = new PrefixCommandModule('!', 'test.js', {
            execute: () => { },
        });

        expect(module.prefix).toBe('!');
    });

    describe('Testing listener method', () => {
        it('should call execute method with correct args', async () => {
            const execute = jest.fn();
            const module = new PrefixCommandModule('!', 'test.js', {
                execute,
            });

            await module.listener({ content: '!test 1234' } as any);
            expect(execute).toHaveBeenCalled();
            expect(execute).toHaveBeenCalledWith({ content: '!test 1234' } as any, ['1234']);
        });

        it('should call filterCallback method with correct args', async () => {
            const filterCallback = jest.fn();
            const module = new PrefixCommandModule('!', 'test.js', {
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
            const module1 = new PrefixCommandModule('!', 'test.js', {
                execute: () => { },
            });

            expect(module1.matches({ content: '!test' } as any)).toBe(true);
        });

        it('should return false', () => {
            const module1 = new PrefixCommandModule('!', 'test.js', {
                execute: () => { },
            });

            expect(module1.matches({ content: 'test' } as any)).toBe(false);
            expect(module1.matches({ content: '!invalid' } as any)).toBe(false);
        });
    })
});
