const fs = require("fs/promises");
const {resolve} = require("path");

const readDirectory = async function (path, downStreamFunction) {
    const resolvedPath = resolve(__dirname, path);
    const directoryRead = await fs.opendir(resolvedPath);

    for await (const entry of directoryRead) {
        const absolutePath = resolve(__dirname, path, entry.name);
        if (entry.isDirectory()) {
            await readDirectory(absolutePath, downStreamFunction);
        } else if (entry.isFile()) {
            downStreamFunction(absolutePath);
        }
    }
};

module.exports = {
    readDirectory,
}
