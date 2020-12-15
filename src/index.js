const {ReadDirectory} = require("./directoryReader");
const {readFile} = require("./fileReader");
const {once} = require("events");

const wait = stream => once(stream, "close");

const printValues = (data) => console.log(data);
const readFileDownStreamFunction = (file) => readFile(file).onEachLine(printValues).execute(wait);

function toList() {
    const collection = [];

    return {
        acc: (data) => collection.push(data),
        get: () => collection,
    };
}
let counter = 0;
new ReadDirectory("../../markdown-links-analyzer/node_modules")
    .onData(data => console.log(data))
    .transform((data) => data.fileName)
    .onData(data => console.log(++counter))
    //.transform((data) => data + " cuek")
    //.filter(data => data.fileName === "fileReader.test.js")
    //.filter(data => data.resolvedPath.includes("test/resources/folder1/more_resources"))
    .execute(toList());



