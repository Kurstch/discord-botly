import EventModule from '../../src/modules/EventModule';

describe('Testing EventModule', () => {
    it('should return true when calling `matches`', () => {
        const module = new EventModule('test.js', { execute: () => { } });
        expect(module.matches()).toBe(true);
    });
});
