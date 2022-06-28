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
        expect(res).toHaveLength(2);
        expect(res.find(p => path.basename(p) == 'ping.js')).toBeTruthy();
        expect(res.find(p => path.basename(p) == 'ban.js')).toBeTruthy();
    });

    describe('Testing importModules method', () => {
        it('should call createModule method 2 times with correct params', () => {
            createManager();
            const dirReadRes = readDirSpy.mock.results[0].value;

            console.log(dirReadRes);

            expect(createModuleSpy).toBeCalledTimes(2);
            expect(createModuleSpy).toBeCalledWith(path.basename(dirReadRes[0]), require(dirReadRes[0]));
            expect(createModuleSpy).toBeCalledWith(path.basename(dirReadRes[1]), require(dirReadRes[1]));
        });

        it('should throw because of invalid module', () => {
            expect(
                () => createManager(path.join(__dirname, '../mock/invalidModules'))
            ).toThrowError();
        });

        it('should return correct data', () => {
            const manager = createManager();
            expect(manager.modules).toHaveLength(2);
            expect(manager.modules[0].commandData).toBeInstanceOf(Object);
            expect(manager.modules[0].commandData.name).toBe('ban');
            expect(manager.modules[0].execute).toBeInstanceOf(Function);
        });
    });

    it('should log results after all modules have been initialized', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        createManager();

        expect(consoleSpy).toHaveBeenLastCalledWith(`> Successfully initialized 2 module(s) from ${dirPath}`);
    });
});
