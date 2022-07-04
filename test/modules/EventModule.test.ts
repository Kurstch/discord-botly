import EventModuleManager from '../../src/moduleManagers/EventModuleManager';
import EventModule from '../../src/modules/EventModule';
import dummyManager from '../mock/dummyManager'

describe('Testing EventModule', () => {
    it('should return true when calling `matches`', () => {
        const module = new EventModule(dummyManager as EventModuleManager, 'test.js', { execute: () => { } });
        expect(module.matches()).toBe(true);
    });
});
