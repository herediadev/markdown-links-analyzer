const fs = require("fs/promises");
const directoryReader = require("../src/directoryReader");

describe("Given the directory reader module", () => {

    describe("When it calls the method", () => {

        it('it will read the directory recursively', async () => {
            //Arrange
            const downStreamFunction = jest.fn().mockName("downStreamFunction");
            const isDirectoryMockFn = jest.fn(() => true).mockName("isDirectoryMockFn");
            const isFileMockFn = jest.fn(() => true).mockName("isFileMockFn");
            const spyOnOpendir = jest.spyOn(fs, "opendir");

            spyOnOpendir.mockImplementationOnce(args => {
                return [Promise.resolve({
                    name: "testDir",
                    isDirectory: isDirectoryMockFn
                })];
            }).mockImplementationOnce(args => {
                return [Promise.resolve({
                    name: "testFile",
                    isDirectory: () => false,
                    isFile: isFileMockFn
                })];
            });

            //Act
            await directoryReader.readDirectory("./test/resources", downStreamFunction);

            //Assert
            expect(isDirectoryMockFn).toBeCalled();
            expect(isFileMockFn).toBeCalled();
            expect(downStreamFunction).toBeCalled();

        });

    });
});
