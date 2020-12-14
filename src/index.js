const {readDirectory} = require("./directoryReader");
const {readFile} = require("./fileReader");
const {once} = require("events");


readDirectory("/Users/rafael/Workspace/Webstorm/markdown-links-analyzer/node_modules")
    .onData(data => console.log(data))
    .filter(data => data.fileName === "fileReader.test.js")
    .filter(data => data.resolvedPath.includes("test/resources/folder1/more_resources"))
    .transform(data => data.fileName + " onTransformFunction")
    .onData(data => console.log(data + " onDataFunction"))
    .execute();


