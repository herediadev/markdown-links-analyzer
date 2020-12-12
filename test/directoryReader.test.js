const fs = require("fs/promises");
const path = require("path");
const {readDirectory} = require("../src/directoryReader");

describe("Given the directory reader module", () => {

    describe("When it calls the method", () => {

        it('it will read the directory recursively', async () => {
            //Arrange
            const transformFunction1 = jest.fn().mockImplementation((data) => data + "_transform1").mockName("transformFunction1");
            const transformFunction2 = jest.fn().mockImplementation((data) => data + "_transform2").mockName("transformFunction2");
            const onDataFunction = jest.fn().mockImplementation((data) => data).mockName("onDataFunction");
            const isDirectoryMockFn = jest.fn(() => true).mockName("isDirectoryMockFn");
            const isFileMockFn = jest.fn(() => true).mockName("isFileMockFn");
            const spyOnOpendir = jest.spyOn(fs, "opendir").mockName("spyOnOpendir");
            const spyOnResolve = jest.spyOn(path, "resolve").mockName("spyOnResolve");

            spyOnResolve
                .mockImplementationOnce((args) => "testDir")
                .mockImplementationOnce(() => "testFile")

            spyOnOpendir
                .mockImplementationOnce(args => [Promise.resolve({
                    name: "testDir",
                    isDirectory: isDirectoryMockFn
                })])
                .mockImplementationOnce(args => [Promise.resolve({
                    name: "testFile",
                    isDirectory: () => false,
                    isFile: isFileMockFn
                })]);

            //Act
            await readDirectory("../test")
                .transform(transformFunction1)
                .transform(transformFunction1)
                .transform(transformFunction2)
                .onData(onDataFunction)
                .execute();


            //Assert
            expect(isDirectoryMockFn).toBeCalledTimes(1);
            expect(isFileMockFn).toBeCalledTimes(1);
            expect(transformFunction1).toBeCalledTimes(2);
            expect(transformFunction2).toBeCalledTimes(1);
            expect(onDataFunction).toBeCalledTimes(1);
            expect(onDataFunction).toBeCalledWith("testFile/testFile_transform1_transform1_transform2");
        });
    });
});
