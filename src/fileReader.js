const fs = require("fs");
const {createInterface} = require("readline");

const readFile = (file) => {
    const readLineStream = createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });

    this.thenCall = (downstreamFunction) => {
        readLineStream.on("line", downstreamFunction);
        return this;
    };

    this.waitUntilClose = async (waitOnce) => {
        await waitOnce(readLineStream);
    };

    return {
        thenCall: this.thenCall,
        waitUntilClose: this.waitUntilClose
    }
};

module.exports = {
    readFile
}
