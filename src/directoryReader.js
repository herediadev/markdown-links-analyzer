const fs = require("fs/promises");
const events = require("events");
const {resolve} = require("path");
const {Readable, Transform} = require("stream");
const {pipeline} = require("stream/promises");

const readDirectory = async (path) => {
    const resolvedPath = resolve(__dirname, path);
    const directoryStream = await fs.opendir(resolvedPath);
    const subDirectories = [];

    const transform = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            if (chunk.isDirectory()) {
                const subDirectory = `${path}/${chunk.name}`;
                subDirectories.push(subDirectory);
                callback();
            } else {
                console.log(chunk);
                callback(null, chunk);
            }
        }
    });
    const readableDirectoryStream = Readable.from(directoryStream);

    await pipeline([
            readableDirectoryStream,
            transform
        ]
    );

    for (const subDirectory of subDirectories) {
        await readDirectory(subDirectory);
    }

};

module.exports = {
    readDirectory,
}
