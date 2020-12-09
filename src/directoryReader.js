const fs = require("fs/promises");
const events = require("events");
const {resolve} = require("path");
const {Readable} = require("stream");

const readDirectory = async function (path) {
    const resolvedPath = resolve(__dirname, path);
    const directoryRead = await fs.opendir(resolvedPath);
    const readableDirectoryStream = Readable.from(directoryRead);

    this.thenCall = (downStreamFunction) => {
        readableDirectoryStream.on("data", async (data) => {
            const absolutePath = resolvedPath + "/" + data.name;
            if (data.isDirectory()) {
                await readDirectory(absolutePath).then(directoryStream => directoryStream.thenCall(downStreamFunction));
            } else if (data.isFile()) {
                downStreamFunction(absolutePath);
            }
        });

        return this;
    };

    this.waitUntilClose = async () => {
        await events.once(readableDirectoryStream, "close");
    }

    return {
        thenCall: this.thenCall,
        waitUntilClose: this.waitUntilClose
    }
};

module.exports = {
    readDirectory,
}
