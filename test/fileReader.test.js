const fs = require("fs");
const {readFile} = require("../src/fileReader");

describe("Given the File Reader Module", () => {

    describe("When it calls the method", () => {

        it('it will call the downstream function', async () => {
            //Arrange
            const downstreamFunction = jest.fn((line) => console.log(line)).mockName("downstreamFunction");

            const spyOn = jest.spyOn(fs, "createReadStream");
            spyOn.mockImplementation(() => fs.ReadStream.from("testReadable"));

            //Act
            await readFile("testFile.md", downstreamFunction);

            //Assert
            expect(downstreamFunction).toBeCalledWith("testReadable");
        });
    });
});
