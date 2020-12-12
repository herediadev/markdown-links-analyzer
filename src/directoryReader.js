const fs = require("fs/promises");
const path = require("path");
const {Readable, Transform} = require("stream");
const {pipeline} = require("stream/promises");

const readDirectory = (dirPath, passTransform = []) => {
    const resolvedPath = path.resolve(__dirname, dirPath);
    const subDirectories = [];
    const transforms = passTransform;

    const checkSubDirectories = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            const newPath = `${resolvedPath}/${chunk.name}`;
            if (chunk.isDirectory()) {
                subDirectories.push(newPath);
                callback();
            } else if (chunk.isFile()) {
                callback(null, newPath);
            }
        }
    });

    this.transform = (transformFunction) => {
        transforms.push((chunk, encoding, callback) => {
            callback(null, transformFunction(chunk));
        });
        return this;
    };

    this.onData = (transformFunction) => {
        transforms.push((chunk, encoding, callback) => {
            transformFunction(chunk);
            callback(null, chunk);
        });
        return this;
    };

    this.execute = async () => {
        const directoryStream = await fs.opendir(resolvedPath);
        const readableDirectoryStream = Readable.from(directoryStream);
        const pipes = transforms.map(transform => new Transform({objectMode: true, transform: transform}));

        await pipeline([
                readableDirectoryStream,
                checkSubDirectories,
                ...pipes,
            ]
        );

        for (const subDirectory of subDirectories) {
            await readDirectory(subDirectory, transforms).execute();
        }
    };

    return {
        transform: this.transform,
        onData: this.onData,
        execute: this.execute,
    }

};

module.exports = {
    readDirectory,
}
