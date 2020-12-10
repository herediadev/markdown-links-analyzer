const fs = require("fs/promises");
const events = require("events");
const {resolve} = require("path");
const {Readable} = require("stream");

const readDirectory = function (path) {
    const resolvedPath = resolve(__dirname, path);

    this.process = async (downStreamFunction) => {
        const directoryRead = await fs.opendir(resolvedPath);
        const readableDirectoryStream = Readable.from(directoryRead)
            .on("data", async (data) => {
            const absolutePath = resolvedPath + "/" + data.name;
            if (data.isDirectory()) {
                const directoryStream = readDirectory(absolutePath);
                await directoryStream.process(downStreamFunction);
            } else if (data.isFile()) {
                downStreamFunction(absolutePath);
            }
        });

        await events.once(readableDirectoryStream, "close");
    };

    return {
        process: this.process,
    }
};

module.exports = {
    readDirectory,
}
