const path = require('node:path');
const fs = require('node:fs');
const os = require('os');
const readline = require('node:readline');

const fileName = 'text.txt';
const file = path.join(__dirname, fileName);
const ws = fs.createWriteStream(file); //
const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt(
  'Please enter data to write to "text.txt" file.\nTo finish type "exit" or press "Ctrl-c"\n',
);
rl.prompt();

process.on('exit', (err) => {
  if (err) console.log(err);
  console.log('Farewell! thanx for using this dumb prog');
  ws.close();
});

rl.on('line', (l) => {
  if (l === 'exit') {
    process.exit();
  }
  ws.write(l);
  ws.write(os.EOL);
});
