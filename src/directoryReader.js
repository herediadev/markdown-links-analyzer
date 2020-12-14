const fs = require("fs/promises");
const events = require("events");
const {resolve} = require("path");
const {Readable, Transform, Writable, PassThrough, pipeline} = require("stream");

let count = 0;

const readDirectory = (path, transformFunctions = []) => {
    const subDirectories = [];
    const transforms = transformFunctions;

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

    this.execute = async () => {
        const resolvedPath = resolve(__dirname, path);
        const readableStream = createNewReadablePipeLine(transforms);

        for await (const dir of await fs.opendir(resolvedPath)) {
            const newPath = `${resolvedPath}/${dir.name}`;
            if (dir.isDirectory()) {
                console.log(++count)
                subDirectories.push(path + "/" + dir.name);
            } else if (dir.isFile()) {
                readableStream.push({
                    fileName: dir.name,
                    filePath: newPath,
                    resolvedPath,
                });
            }
        }

        for (const subDirectory of subDirectories) {
            await readDirectory(subDirectory, transforms).execute();
        }
        readableStream.push(null);
    }

    return {
        filter: this.filter,
        transform: this.transform,
        onData: this.onData,
        execute: this.execute,
    }
};

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
        new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                //console.log(chunk);
                callback(null, chunk);
            }
        }),
        ...pipes
    ], () => {
        console.log("pipeline finished");
    });
    return readableStream;
}

module.exports = {
    readDirectory,
}
