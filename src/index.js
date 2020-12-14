const {ReadDirectory} = require("./directoryReader");
const {readFile} = require("./fileReader");
const {once} = require("events");

const wait = stream => once(stream, "close");

const printValues = (data) => console.log(data);
const readFileDownStreamFunction = (file) => readFile(file).onEachLine(printValues).execute(wait);


new ReadDirectory("../../markdown-links-analyzer/test")
    //.onData(data => console.log(data))
    .filter(data => data.fileName === "fileReader.test.js")
    .filter(data => data.resolvedPath.includes("test/resources/folder1/more_resources"))
    .execute();



