const fs = require("fs/promises");
const {resolve} = require("path");
const {Readable} = require("stream");

const readDirectory = async function (path) {
    const resolvedPath = resolve(__dirname, path);
    const directoryRead = await fs.opendir(resolvedPath);
    const readableDirectoryStream = Readable.from(directoryRead);

    this.thenCall = (downStreamFunction) => {
        readableDirectoryStream.on("data", (data) => {
            const absolutePath = resolvedPath + "/" + data.name;
            if (data.isDirectory()) {
                readDirectory(absolutePath).then(directoryStream => directoryStream.thenCall(downStreamFunction));
            } else if (data.isFile()) {
                downStreamFunction(absolutePath);
            }
        });

        return this;
    };

    this.waitUntilClose = async (wait) => {
        await wait(readableDirectoryStream);
    }

    return {
        thenCall: this.thenCall,
        waitUntilClose: this.waitUntilClose
    }
};

module.exports = {
    readDirectory,
}
