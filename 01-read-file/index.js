const fs = require('node:fs');
const path = require('node:path');

const fileName = 'text.txt';
const file = path.join(__dirname, fileName);

const rs = fs.createReadStream(file);
rs.on('data', (stream) => {
  process.stdout.write(stream);
});
