const {readDirectory} = require("./directoryReader");
const {readFile} = require("./fileReader");


(async () => {
    await readDirectory("../test",
        (file) => readFile(file, (data) => console.log(data)))
})();

