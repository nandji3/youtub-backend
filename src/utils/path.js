const path = require("path");

const rootDir = path.dirname(require.main.filename);

console.log("rootDir", rootDir);
console.log(path.join(rootDir, "views", "404.html"))

module.exports = { rootDir };