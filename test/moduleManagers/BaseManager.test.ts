import BaseManager from '../../src/moduleManagers/BaseManager';
import path from 'path';

class DummyBaseManager extends BaseManager<any, any> {
    addListener(): void { }
    createModule(_: any, module: any) {
        if (module.invalid) throw new Error('Invalid module');
        return module;
    }
}

const dirPath = path.join(__dirname, '../mock/commands');
const createManager = (customDirPath?: string): DummyBaseManager => {
    return new DummyBaseManager({} as any, customDirPath ?? dirPath);
};

describe('Testing BaseManager', () => {
    const createModuleSpy = jest.spyOn(DummyBaseManager.prototype as any, 'createModule');
    const readDirSpy = jest.spyOn(DummyBaseManager.prototype as any, 'readDir');

    afterEach(() => jest.clearAllMocks());

    it('should get all javascript files from the mock directory', () => {
        createManager();
        const res: any[] = readDirSpy.mock.results[0].value;

        expect(readDirSpy).toHaveBeenCalledTimes(1); // Reads subdirectories recursively
        expect(res).toHaveLength(4);
        expect(res.find(p => path.basename(p) == 'ping.js')).toBeTruthy();
        expect(res.find(p => path.basename(p) == 'ban.js')).toBeTruthy();
    });

    describe('Testing importModules method', () => {
        afterEach(() => jest.clearAllMocks());

        it('should call createModule method 2 times with correct params', () => {
            createManager();
            const dirReadRes = readDirSpy.mock.results[0].value
                .filter((res: string) => !path.basename(res).startsWith('__'));

            expect(createModuleSpy).toBeCalledTimes(2);
            expect(createModuleSpy).toBeCalledWith(dirReadRes[0], require(dirReadRes[0]));
            expect(createModuleSpy).toBeCalledWith(dirReadRes[1], require(dirReadRes[1]));
        });

        it('should throw because of invalid module', () => {
            expect(
                () => createManager(path.join(__dirname, '../mock/invalidModules'))
            ).toThrowError();
        });

        it('should throw because of invalid filter', () => {
            expect(
                () => createManager(path.join(__dirname, '../mock/invalidFilter'))
            ).toThrowError();
        });

        it('should add 2 modules to `this.modules`', () => {
            const manager = createManager();
            expect(manager.modules).toHaveLength(2);
            expect(manager.modules[0].commandData).toBeInstanceOf(Object);
            expect(manager.modules[0].commandData.name).toBe('ban');
            expect(manager.modules[0].execute).toBeInstanceOf(Function);
        });

        it('should add 2 filters to `this.filters`', () => {
            const manager = createManager();
            expect(manager.filters.size).toBe(2);
            expect(manager.filters.first()).toBeInstanceOf(Function);
        });
    });

    describe('Testing validateFilterModule method', () => {
        const spy = jest.spyOn(DummyBaseManager.prototype as any, 'validateFilterModule');
        const impl = spy.getMockImplementation()!;
        const filepath = 'test';

        it('should pass validation', () => {
            const testFilter = { default: () => true };
            expect(() => impl(filepath, testFilter)).not.toThrow();
        });

        it('should throw when validating', () => {
            const testFilter = { default: null };
            expect(() => impl(filepath, testFilter)).toThrowError();
        });
    })

    it('should log results after all modules have been initialized', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        createManager();

        expect(consoleSpy).toHaveBeenLastCalledWith(`> Successfully initialized 2 module(s) from ${dirPath}`);
    });
});
