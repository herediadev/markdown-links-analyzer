const fs = require("fs");
const {readFile} = require("../src/fileReader");
const events = require("events");

describe("Given the File Reader Module", () => {

    describe("When it calls the method", () => {

        it('it will call the downstream function', async () => {
            //Arrange
            const downstreamFunction = jest.fn((line) => console.log(line)).mockName("downstreamFunction");

            const spyInstanceOnOnce = jest.spyOn(events, "once").mockName("spyInstanceOnOnce");
            const spyOnCreateReadStream = jest.spyOn(fs, "createReadStream").mockName("spyOnCreateReadStream");

            spyOnCreateReadStream.mockImplementation(() => fs.ReadStream.from("testReadable"));

            //Act
            await readFile("testFile.md")
                .thenCall(downstreamFunction)
                .waitUntilClose((stream) => events.once(stream, "close"));

            //Assert
            expect(downstreamFunction).toBeCalledWith("testReadable");
            expect(spyInstanceOnOnce).toBeCalledTimes(1);
        });
    });
});
