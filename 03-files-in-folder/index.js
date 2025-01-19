const path = require('node:path');
// const fs = require('node:fs');
const fsp = require('node:fs/promises');

const dirPath = 'secret-folder';
const fullPath = path.join(__dirname, dirPath);

// Async readdir
// fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
//   files.forEach((file) => {
//     if (file.isFile()) {
//       const filePath = path.join(fullPath, file.name);
//       fs.stat(filePath, (err, stat) => {
//         const fileExt = path.extname(file.name);
//         const fileName = path.basename(filePath, fileExt);
//         console.log(`${fileName} - ${fileExt.slice(1)} - ${stat.size}b`);
//       });
//     }
//   });
// });

// Promises readdir
readFilesInDir(fullPath).then((files) => {
  if (files?.length) {
    files.forEach(async (file) => {
      const st = await fsp.stat(path.join(fullPath, file.name));
      if (st.isFile()) {
        const fileExt = path.extname(file.name);
        const fileName = path.basename(file.name, fileExt);
        const fileSize = (st.size / 1024).toFixed(2);
        console.log(`${fileName} - ${fileExt.slice(1)} - ${fileSize}Kb`);
      }
    });
  } else {
    console.log('Is directory empty? or thera is no _secret_ diretory )');
  }
});

async function readFilesInDir(p) {
  let allFiles;
  try {
    allFiles = await fsp.readdir(p, { withFileTypes: true });
    return allFiles;
  } catch (error) {
    console.log(error);
  }
}
