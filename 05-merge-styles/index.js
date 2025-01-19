const path = require('node:path');
// const fsp = require('node:fs/promises');
const fs = require('node:fs');

const source = 'styles';
const project = 'project-dist';
const bundleFN = 'bundle.css';
const sourcePath = path.join(__dirname, source);
const projectPath = path.join(__dirname, project);

cssBundle(sourcePath, projectPath, bundleFN);

async function cssBundle(source, dest, file) {
  const bundle = path.join(dest, file);
  let bundleStream;
  try {
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
        })
      }
    });
  } catch (error) {
    console.log(error);
  }
}
