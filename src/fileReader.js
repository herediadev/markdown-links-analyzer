const fs = require("fs");
const {createInterface} = require("readline");
const {once} = require("events");

const readFile = async (file, downstreamFunction) => {
    const rl = createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });

    rl.addListener("line", (data) => {
        downstreamFunction(data);
    });

    await once(rl, "close");
};

module.exports = {
    readFile
}
