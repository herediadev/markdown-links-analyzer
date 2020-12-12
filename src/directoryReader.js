const fs = require("fs/promises");
const {resolve} = require("path");
const {Readable, Transform} = require("stream");
const {pipeline} = require("stream/promises");

const readDirectory = (path, passTransform = []) => {
    const resolvedPath = resolve(__dirname, path);
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
        transforms.push(transformFunction);
        return this;
    };

    this.execute = async () => {
        const directoryStream = await fs.opendir(resolvedPath);
        const readableDirectoryStream = Readable.from(directoryStream);
        const pipes = transforms.map(transformFunction => new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                callback(null, transformFunction(chunk));
            }
        }));

        await pipeline([
                readableDirectoryStream,
                checkSubDirectories,
                ...pipes,
            ]
        );

        for (const subDirectory of subDirectories) {
            const subDirectoryStream = readDirectory(subDirectory, transforms);
            await subDirectoryStream.execute();
        }
    };

    return {
        transform: this.transform,
        execute: this.execute,
    }

};

module.exports = {
    readDirectory,
}
