const fs = require("fs/promises");
const path = require("path");
const {readDirectory} = require("../src/directoryReader");

const wait = async (time) => new Promise(resolve => setTimeout(resolve, time));

jest.mock("fs");
jest.mock("path");

describe("Given the directory reader module", () => {

    describe("When it calls the method", () => {

        it('it will read the directory recursively', async () => {
            //Arrange
            const transformFunction1 = jest.fn().mockImplementation((data) => data + "_transform1").mockName("transformFunction1");
            const transformFunction2 = jest.fn().mockImplementation((data) => data + "_transform2").mockName("transformFunction2");
            const onDataFunction = jest.fn().mockImplementation((data) => data).mockName("onDataFunction");
            const isDirectoryMockFn = jest.fn().mockImplementation(() => true).mockName("isDirectoryMockFn");
            const isFileTrueMockFn = jest.fn().mockImplementation(() => true).mockName("isFileTrueMockFn");
            const filterFunction = jest.fn().mockImplementation(data => data.includes("testFile.js")).mockName("filterFunction");
            const spyOnOpendir = jest.spyOn(fs, "opendir").mockName("spyOnOpendir");
            const spyOnResolve = jest.spyOn(path, "resolve").mockName("spyOnResolve");

            spyOnResolve.mockImplementation(() => "test");

            spyOnOpendir.mockImplementationOnce(() => [
                Promise.resolve({
                    name: "testDir",
                    isDirectory: isDirectoryMockFn,
                    isFile: () => false
                }),
                Promise.resolve({
                    name: "testFile.js",
                    isDirectory: () => false,
                    isFile: isFileTrueMockFn
                })
            ]).mockImplementationOnce(() => [
                Promise.resolve({
                    name: "testFile1.js",
                    isDirectory: () => false,
                    isFile: isFileTrueMockFn
                }),
                Promise.resolve({
                    name: "testFile2.js",
                    isDirectory: () => false,
                    isFile: isFileTrueMockFn
                })
            ]);

            //Act
            await readDirectory("../test")
                .recursiveMode()
                .filter(filterFunction)
                .transform(transformFunction1)
                .transform(transformFunction1)
                .transform(transformFunction2)
                .onData(onDataFunction)
                .execute();

            await wait(2000);

            //Assert
            expect(filterFunction).toBeCalledTimes(3);
            expect(isDirectoryMockFn).toBeCalledTimes(1);
            expect(isFileTrueMockFn).toBeCalledTimes(3);
            expect(transformFunction1).toBeCalledTimes(4);
            expect(transformFunction2).toBeCalledTimes(2);
            expect(onDataFunction).toBeCalledTimes(2);
            expect(onDataFunction).not.toHaveBeenCalledWith("test/testFile.js_transform1_transform1_transform2");
            expect(onDataFunction).toHaveBeenNthCalledWith(1, "test/testFile1.js_transform1_transform1_transform2");
            expect(onDataFunction).toHaveBeenNthCalledWith(2, "test/testFile2.js_transform1_transform1_transform2");
        });
    });
});
