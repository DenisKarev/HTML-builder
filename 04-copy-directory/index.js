const path = require('node:path');
// const fs = require('node:fs');
const fsp = require('node:fs/promises');
// const os = require("os");

const source = 'files';
const destination = 'files-copy';
const sourcePath = path.join(__dirname, source);
const destPath = path.join(__dirname, destination);


copyFiles(sourcePath, destPath).catch(err => console.log(err));

// makeDirectory(targetPath).catch(err => console.log(err));

async function copyFiles(source, dest) {
    const sourceFiles = await fsp.readdir(dirPath, { withFileTypes: true });
    const dir = await fsp.mkdir(dest, { recursive: true });
    await makeDirectory(dest).catch(err => console.log(err));
    // console.log(sourceFiles);
    // console.log(sourcePath, destPath);
    sourceFiles.forEach(async (file) => {
        const srcFilePath = path.join(source, file.name)
        const destFilePath = path.join(dest, file.name)
        const stat = await fsp.stat(srcFilePath);
        if (stat.isFile()) {
            await fsp.copyFile(srcFilePath, destFilePath);
        } else if (stat.isDirectory()) {
            const newSrc = path.join(source, file.name);
            const newDest = path.join(dest, file.name);
            console.log(newSrc, '|', newDest);
            await copyFiles(newSrc, newDest);
        }
    })
}

async function makeDirectory(path) {
    let dir;
    try {
        dir = await fsp.mkdir(path, { recursive: true });
        if (!dir) dir = 'err';
    } catch (error) {
        // console.log(error);
        dir = 'err';
    }
    if (dir === 'err') {
        const stat = await fsp.stat(path);
        if (stat.isFile()) {
            console.log(`${path} file exist. Deleting... and recreating directory`);
            const err = await fsp.rm(path, { recursive: true });
            if (!err) await makeDirectory(path);
        } else if (stat.isDirectory()) {
            const files = await readFilesInDir(destPath);
            if (files?.length) {
                const err = await fsp.rm(path, { recursive: true });
                if (!err) {
                    fsp.mkdir(path, { recursive: true })
                    console.log(`Non-empty directory ${path} already exist.\nDeleted and recreated. (I don't bother had it files or not, i need empty directory! ))`);
                }
            }
        } else {
            console.log(error);
        }
    }
}

async function readFilesInDir(dirPath) {
    let allFiles;
    try {
        allFiles = await fsp.readdir(dirPath, { withFileTypes: true });
        return allFiles;
    } catch (error) {
        console.log(error);
    }
}