const {readDirectory} = require("./directoryReader");
const {readFile} = require("./fileReader");
const {once} = require("events");

const wait = stream => once(stream, "close");

const printValues = (data) => console.log(data);
const readFileDownStreamFunction = (file) => readFile(file).onEachLine(printValues).execute(wait);
const processDirectory = directoryStream => directoryStream.thenCall(readFileDownStreamFunction);

readDirectory("../test")
    .then(processDirectory)
    .then(stremDirectory => stremDirectory.waitUntilClose(wait));



