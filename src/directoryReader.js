const fs = require("fs/promises");
const {resolve} = require("path");
const {Readable} = require("stream");
const {once} = require("events");

const readDirectory = async function (path, downStreamFunction) {
    const resolvedPath = resolve(__dirname, path);
    const directoryRead = await fs.opendir(resolvedPath);
    const readableDirectoryStream = Readable.from(directoryRead);

    readableDirectoryStream.on("data", (data) => {
        const absolutePath = resolvedPath + "/" + data.name;
        if (data.isDirectory()) {
            readDirectory(absolutePath, downStreamFunction);
        } else if (data.isFile()) {
            downStreamFunction(absolutePath);
        }
    });

    await once(readableDirectoryStream,"close");
};

module.exports = {
    readDirectory,
}
