// need to copy into source else idk how to access it after build ../ reference doesn't seem to work
// copy ./package.json to ./src/packageJsonCopy.json

const fs = require('fs');

fs.copyFileSync('./package.json', './src/packageJsonCopy.json');
