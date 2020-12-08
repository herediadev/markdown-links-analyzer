const {readDirectory} = require("./directoryReader");
const {readFile} = require("./fileReader");


const printValues = (data) => console.log(data);
const readFileDownStreamFunction = (file) => readFile(file).thenCall(printValues);
const processDirectory = directoryStream => directoryStream.thenCall(readFileDownStreamFunction);

readDirectory("../test")
    .then(processDirectory);



