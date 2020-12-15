const fs = require("fs/promises");
const {resolve} = require("path");
const {Readable, Writable, Transform, pipeline} = require("stream");

const readEntry = async (resolvedPath, entry, readableStream, recursive) => {
    const newPath = `${resolvedPath}/${entry.name}`;
    if (entry.isDirectory()) {
        await readDir(newPath, readableStream, recursive);
    } else if (entry.isFile()) {
        readableStream.push({
            fileName: entry.name,
            filePath: newPath,
            resolvedPath,
        })
    }
};

const readDir = async (resolvedPath, readableStream, recursive) => {
    for await (const entry of await fs.opendir(resolvedPath)) {
        await readEntry(resolvedPath, entry, readableStream, recursive);
    }
};

const recursive = async (subDirectory, readableStream) => {
    const resolvedPath = resolve(__dirname, subDirectory);

    await readDir(resolvedPath, readableStream, recursive);

};

const createNewReadablePipeLine = (transforms = []) => {
    const readableStream = new Readable({
        objectMode: true,
        read(size) {
        }
    });

    const pipes = transforms.map(transform => new Transform({
        objectMode: true, transform
    }));

    const writeable = pipeline([
        readableStream,
        ...pipes,
        new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                callback(null,chunk);
            }
        })
    ], () => {
        console.log("pipeline finished");
    });

    return {
        readableStream,
        writeable
    };
}

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

    this.execute = async (collectFunction) => {
        const resolvedPath = resolve(__dirname, path);
        const stream = createNewReadablePipeLine(transforms);

        collectFunction && stream.writeable.on("data",collectFunction.collect);

        await readDir(resolvedPath, stream.readableStream, recursive);

        stream.readableStream.push(null);

        return collectFunction && collectFunction.get();
    }

}

module.exports = {
    ReadDirectory,
}
