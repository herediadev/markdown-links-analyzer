const fs = require("fs");
const {readFile} = require("../src/fileReader");
const events = require("events");
const {Transform} = require("stream");

describe("Given the File Reader Module", () => {

    describe("When it calls the method", () => {

        it('it will call the downstream function', async () => {
            //Arrange
            const downstreamFunction = jest.fn().mockImplementation((line) => console.log(line)).mockName("downstreamFunction");

            const transformPipeMockFunction = jest.fn().mockImplementation((line) => line + "Data").mockName("transformPipeMockFunction");
            const spyOnCreateReadStream = jest.spyOn(fs, "createReadStream").mockName("spyOnCreateReadStream");

            spyOnCreateReadStream.mockImplementation(() => fs.ReadStream.from("testReadable"));

            //Act
            await readFile("testFile.md")
                .pipe(line => transformPipeMockFunction(line))
                .onEachLine(line => downstreamFunction(line))
                .execute(stream => events.once(stream, "close"));

            //Assert
            expect(downstreamFunction).toBeCalledWith("testReadableData");
            expect(transformPipeMockFunction).toBeCalledWith("testReadable");
        });
    });
});
