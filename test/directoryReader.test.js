const fs = require("fs/promises");
const {readDirectory} = require("../src/directoryReader");

describe("Given the directory reader module", () => {

    describe("When it calls the method", () => {

        it('it will read the directory recursively', async () => {
            //Arrange
            const downStreamFunction = jest.fn().mockName("downStreamFunction");
            /*const isDirectoryMockFn = jest.fn(() => true).mockName("isDirectoryMockFn");
            const isFileMockFn = jest.fn(() => true).mockName("isFileMockFn");
            const spyOnOpendir = jest.spyOn(fs, "opendir").mockName("spyOnOpendir");

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
            });*/

            //Act
            await readDirectory("../test")
                .transform(downStreamFunction)
                .execute();


            //Assert
            /*expect(isDirectoryMockFn).toBeCalledTimes(1);
            expect(isFileMockFn).toBeCalledTimes(1);*/
            expect(downStreamFunction).toBeCalledTimes(11);
        });

    });
});
