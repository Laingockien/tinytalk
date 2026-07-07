const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const files = ["index.html", "styles.css", "app.js"];
const directories = ["data", "public"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const directory of directories) {
  const source = path.join(root, directory);
  const target = path.join(dist, directory);

  if (fs.existsSync(source)) {
    fs.cpSync(source, target, { recursive: true });
  }
}

console.log("TinyTalk static site built in dist.");
