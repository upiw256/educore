const fs = require('fs');
const path = require('path');

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};

const appFiles = getAllFiles('./app');
const componentFiles = getAllFiles('./components');
const libFiles = getAllFiles('./lib');
const allFiles = [...appFiles, ...componentFiles, ...libFiles];

const fileContents = allFiles.map(f => fs.readFileSync(f, 'utf-8'));

const isFileUsed = (file) => {
    const basename = path.basename(file, path.extname(file));
    // Check if the basename is used in any other file's content
    for (let content of fileContents) {
        if (content.includes(basename)) {
            return true;
        }
    }
    return false;
};

const unusedComponents = componentFiles.filter(f => !isFileUsed(f));
console.log("Unused Components:", unusedComponents.map(f => path.basename(f)));
