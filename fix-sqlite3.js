const fs = require("fs");
const path = require("path");

const filePath = path.resolve(
  __dirname,
  "node_modules",
  "sqlite3",
  "build",
  "Release",
  "node_sqlite3.node"
);

const dest = path.resolve(__dirname, "build", "node_sqlite3.node");

fs.copyFileSync(filePath, dest);
