const fs = require("fs/promises");

const readDirectory = async function (path, downStreamFunction) {
    const directoryRead = await fs.opendir(path);

    for await (const entry of directoryRead) {
        if (entry.isDirectory()) {
            await readDirectory(entry.name, downStreamFunction);
        } else if (entry.isFile()) {
            downStreamFunction();
        }
    }
};

module.exports = {
    readDirectory,
}
