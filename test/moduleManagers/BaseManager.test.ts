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
const createManager = (options?: any): DummyBaseManager => {
    return new DummyBaseManager({} as any, dirPath, options);
};

describe('Testing BaseManager', () => {
    const logInitErrorSpy = jest.spyOn(DummyBaseManager.prototype as any, 'logInitError');
    const createModuleSpy = jest.spyOn(DummyBaseManager.prototype as any, 'createModule');
    const readDirSpy = jest.spyOn(DummyBaseManager.prototype as any, 'readDir');

    afterEach(() => jest.clearAllMocks());

    it('should set Custom params', () => {
        const manager = createManager({ prefix: '!' });
        //@ts-ignore
        expect(manager.prefix).toBe('!');
    });

    it('should get all javascript files from the mock directory', () => {
        createManager();
        const res: any[] = readDirSpy.mock.results[0].value;

        const find = (name: string, filepath: string) => {
            expect(res.find(
                m => m.name === name && m.path === path.join(dirPath, filepath)
            )).toBeTruthy();
        };

        expect(readDirSpy).toHaveBeenCalledTimes(2); // Reads subdirectories recursively
        expect(res).toHaveLength(3);
        find('ping.js', './ping.js');
        find('invalid.js', './invalid.js');
        find('ban.js', './admin/ban.js');
    });

    describe('Testing importModules method', () => {
        it('should call createModule method 3 times with correct params', () => {
            createManager();
            const dirReadRes = readDirSpy.mock.results[0].value;

            expect(createModuleSpy).toBeCalledTimes(3);
            expect(createModuleSpy).toBeCalledWith(dirReadRes[0], require(dirReadRes[0].path));
            expect(createModuleSpy).toBeCalledWith(dirReadRes[1], require(dirReadRes[1].path));
            expect(createModuleSpy).toBeCalledWith(dirReadRes[2], require(dirReadRes[2].path));
        });

        it('should call logInitError because of invalid module', () => {
            createManager();
            const dirReadRes = readDirSpy.mock.results[0].value;

            expect(logInitErrorSpy).toBeCalledTimes(1);
            expect(logInitErrorSpy).lastCalledWith(dirReadRes[1].path, 'Invalid module');
        });

        it('should return correct data', () => {
            const manager = createManager();
            expect(manager.modules).toHaveLength(2);
            expect(manager.modules[0].commandData).toBeInstanceOf(Object);
            expect(manager.modules[0].commandData.name).toBe('ban');
            expect(manager.modules[0].execute).toBeInstanceOf(Function);
        });
    });

    it('should log error if module is invalid', () => {
        const logInitError = jest.fn(DummyBaseManager.prototype['logInitError']);
        const filePath = path.join(dirPath, 'invalid.js');
        const consoleSpy = jest.spyOn(console, 'error');
        logInitError(filePath, 'Invalid module');

        expect(consoleSpy).toHaveBeenCalledWith(`> Failed to initialize ${filePath}`);
        expect(consoleSpy).toHaveBeenCalledWith('\tInvalid module');
    });


    it('should log results after all modules have been initialized', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        createManager();

        expect(consoleSpy).toHaveBeenLastCalledWith(`> Successfully initialized 2 module(s) from ${dirPath}`);
    });
});
