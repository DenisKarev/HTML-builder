const path = require('node:path');
const fsp = require('node:fs/promises');
const fs = require('node:fs');

const stylesSrc = 'styles';
const assetsSrc = 'assets';
const componentsSrc = 'components';
const templateFile = 'template.html';
const project = 'project-dist';
const stylesFile = 'style.css';
const stylesPath = path.join(__dirname, stylesSrc);
const assetsPath = path.join(__dirname, assetsSrc);
const templatePath = path.join(__dirname, templateFile);
const componentsPath = path.join(__dirname, componentsSrc);
const projectPath = path.join(__dirname, project);
const assetsDest = path.join(projectPath, assetsSrc);

copyFiles(assetsPath, assetsDest).catch((err) => console.log(err));
cssBundle(stylesPath, projectPath, stylesFile).catch((err) => console.log(err));
parseTemplate(templatePath, projectPath, componentsPath).catch((err) =>
  console.log(err),
);

/** Copy directory structure (with files) recursively
 *
 * @param {fs.PathLike} source  source path to copy files
 * @param {fs.PathLike} dest    destination path to land files to
 */
async function copyFiles(source, dest) {
  let sourceFiles, dir, destFiles;
  try {
    sourceFiles = await fsp.readdir(source, { withFileTypes: true });
    dir = await fsp.mkdir(dest, { recursive: true });
    if (dir == undefined) {
      destFiles = await fsp.readdir(dest, { withFileTypes: true });
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
    } else if (stat.isDirectory()) {
      const newSrc = path.join(source, file.name);
      const newDest = path.join(dest, file.name);
      copyFiles(newSrc, newDest).catch((err) => console.log(err));
    }
  });
  if (dir === undefined) {
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
}

/** Merge *.css files in src path to a destination path/file.css (not recursively)
 *
 * @param {fs.PathLike} source  source path to process files
 * @param {fs.PathLike} dest    destination path of a bundle
 * @param {string} file    filename of a css bundle
 */
async function cssBundle(source, dest, file) {
  const bundle = path.join(dest, file);
  let bundleStream;
  try {
    await fsp.mkdir(projectPath, { recursive: true });
    bundleStream = fs.createWriteStream(bundle);
    fs.readdir(source, { withFileTypes: true }, (err, files) => {
      if (!err) {
        files.forEach((file) => {
          const fileFullPath = path.join(source, file.name);
          if (path.extname(fileFullPath) === '.css') {
            const rs = fs.createReadStream(fileFullPath);
            rs.setEncoding('utf-8');
            // rs.on('data', (chunk) => {
            //   bundleStream.write(chunk);
            // })
            rs.pipe(bundleStream);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 *
 * @param {fs.PathLike} template    path to a single html template file
 * @param {fs.PathLike} dist        path to destination folder
 * @param {fs.PathLike} components  path to components filder
 * @param {string} destFile    target filename (index.html by default)
 */
async function parseTemplate(template, dist, components, file = 'index.html') {
  // const htmlTemplate = fsp.createReadStream(template, { encoding: 'utf8' });
  // htmlTemplate.on('data', (d) => {
  //   htmlString += d;
  // });
  let htmlString = await fsp.readFile(template, { encoding: 'utf8' });
  const htmlOutputFilePath = path.join(dist, file);
  // const htmlOutput = fs.createWriteStream(htmlOutputFilePath);
  let componentsFiles = await fsp.readdir(components, { withFileTypes: true });
  componentsFiles = componentsFiles.filter(
    (f) => f.isFile() && path.extname(f.name) === '.html',
  );

  for await (const f of componentsFiles) {
    const currName = `{{${f.name.split('.')[0]}}}`;
    const currCompPath = path.join(components, f.name);
    const currComponent = await fsp.readFile(currCompPath, {
      encoding: 'utf8',
    });
    const currRegExp = RegExp(`${currName}`, 'gi');
    if (htmlString.includes(currName))
      htmlString = htmlString.replace(currRegExp, currComponent);
  }
  await fsp.writeFile(htmlOutputFilePath, htmlString);
}
