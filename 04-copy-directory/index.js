const path = require('node:path');
const fsp = require('node:fs/promises');

const source = 'files';
const destination = 'files-copy';
const sourcePath = path.join(__dirname, source);
const destPath = path.join(__dirname, destination);

copyFiles(sourcePath, destPath).catch((err) => console.log(err));

async function copyFiles(source, dest) {
  let sourceFiles, dir, destFiles;
  try {
    sourceFiles = await fsp.readdir(sourcePath, { withFileTypes: true });
    dir = await fsp.mkdir(destPath, { recursive: true });
    if (dir == undefined) {
      destFiles = await fsp.readdir(destPath, { withFileTypes: true });
    }
  } catch (error) {
    console.log(error);
  }
  sourceFiles.forEach(async (file) => {
    const srcFilePath = path.join(source, file.name);
    const destFilePath = path.join(dest, file.name);
    const stat = await fsp.stat(srcFilePath);
    if (stat.isFile()) {
      try {
        await fsp.copyFile(srcFilePath, destFilePath);
      } catch (error) {
        console.log(error);
      }
    }
  });
  destFiles.forEach(async (file) => {
    const destFilePath = path.join(dest, file.name);
    const stat = await fsp.stat(destFilePath);
    if (
      stat.isFile() &&
      sourceFiles.findIndex((e) => e.name === file.name) === -1
    ) {
      try {
        await fsp.rm(destFilePath);
      } catch (error) {
        console.log(error);
      }
    }
  });
}
