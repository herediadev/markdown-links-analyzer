const fs = require("fs/promises");
const path = require("path");
const {Readable, Transform} = require("stream");
const {pipeline} = require("stream/promises");

const readDirectory = (dirPath, passTransform = [], recursiveMode = false) => {
    const resolvedPath = path.resolve(__dirname, dirPath);
    const subDirectories = [];
    const transforms = passTransform;
    let isRecursiveMode = recursiveMode;

    this.transform = (transformFunction) => {
        transforms.push((chunk, encoding, callback) => {
            callback(null, transformFunction(chunk));
        });
        return this;
    };

    this.filter = (filterFunction) => {
        transforms.push((chunk, encoding, callback) => {
            if (filterFunction(chunk))
                callback();
            else
                callback(null, chunk);
        });
        return this;
    };

    this.onData = (onEachDataFunction) => {
        transforms.push((chunk, encoding, callback) => {
            onEachDataFunction(chunk);
            callback(null, chunk);
        });
        return this;
    };

    this.recursiveMode = () => {
        isRecursiveMode = true;
        return this;
    };

    this.execute = async () => {
        const directoryStream = await fs.opendir(resolvedPath);
        const readableDirectoryStream = Readable.from(directoryStream);
        const pipes = transforms.map(transform => new Transform({objectMode: true, transform: transform}));

        const checkSubDirectories = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                const newPath = `${resolvedPath}/${chunk.name}`;
                if (chunk.isDirectory()) {
                    if (isRecursiveMode)
                        subDirectories.push(newPath);
                    callback();
                } else if (chunk.isFile()) {
                    callback(null, newPath);
                }
            }
        });

        await pipeline([
                readableDirectoryStream,
                checkSubDirectories,
                ...pipes,
            ]
        );

        if (isRecursiveMode) {
            for (const subDirectory of subDirectories) {
                await readDirectory(subDirectory, transforms, isRecursiveMode).execute();
            }
        }
    };

    return {
        recursiveMode: this.recursiveMode,
        filter: this.filter,
        transform: this.transform,
        onData: this.onData,
        execute: this.execute,
    }

};

module.exports = {
    readDirectory,
}
