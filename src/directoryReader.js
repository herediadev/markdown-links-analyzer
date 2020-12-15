const fs = require("fs/promises");
const {resolve} = require("path");
const {Readable, Writable, Transform, pipeline} = require("stream");

let readEntry = function (resolvedPath, entry, subDirectories, readableStream) {
    const newPath = `${resolvedPath}/${entry.name}`;
    if (entry.isDirectory()) {
        subDirectories.push(newPath);
    } else if (entry.isFile()) {
        readableStream.push({
            fileName: entry.name,
            filePath: newPath,
            resolvedPath,
        })
    }
};

let readDir = async function (resolvedPath, readableStream, recursive) {
    const subDirectories = [];

    for await (const entry of await fs.opendir(resolvedPath)) {
        readEntry(resolvedPath, entry, subDirectories, readableStream);
    }

    for (const subDirectory of subDirectories) {
        await recursive(subDirectory, readableStream);
    }
};

function ReadDirectory(path = null) {
    const transforms = [];

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
    this.onData = (onEachFunction) => {
        transforms.push((chunk, encoding, callback) => {
            onEachFunction(chunk);
            callback(null, chunk);
        });

        return this;
    };

    const recursive = async (subDirectory, readableStream) => {
        const resolvedPath = resolve(__dirname, subDirectory);

        await readDir(resolvedPath, readableStream, recursive);

    };

    this.execute = async () => {
        const resolvedPath = resolve(__dirname, path);
        const readableStream = createNewReadablePipeLine(transforms);

        await readDir(resolvedPath, readableStream, recursive);

        readableStream.push(null);
    }

}

function createNewReadablePipeLine(transforms = []) {
    const readableStream = new Readable({
        objectMode: true,
        read(size) {
        }
    });
    const pipes = transforms.map(transform => new Transform({
        objectMode: true, transform
    }));

    pipeline([
        readableStream,
        ...pipes,
        new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                callback();
            }
        })
    ], () => {
        console.log("pipeline finished");
    });
    return readableStream;
}

module.exports = {
    ReadDirectory,
}
