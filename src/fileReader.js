const fs = require("fs");
const {createInterface} = require("readline");
const {Readable, Transform} = require("stream");

const readFile = (file) => {
    const readLineStream = createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });

    const stream = new Readable({
        read(size) {
        }, objectMode: true
    });

    let writeStream = stream.pipe(new Transform({
        objectMode: true,
        transform(line, encoding, next) {
            next(null, line);
        }
    }));

    this.pipe = (transformFunction) => {
        writeStream = writeStream.pipe(new Transform({
            objectMode: true,
            transform(line, encoding, next) {
                next(null, transformFunction(line));
            }
        }));

        return this;
    }

    this.onEachLine = (downstreamFunction) => {
        writeStream.on("data", downstreamFunction);
        return this;
    };

    this.execute = async (wait) => {
        readLineStream.on("line", line => stream.push(line));
        readLineStream.on("close", () => stream.push(null));

        await wait(stream);
    }

    return {
        onEachLine: this.onEachLine,
        pipe: this.pipe,
        execute: this.execute
    };
};

module.exports = {
    readFile
}
