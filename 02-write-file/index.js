const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, 'new.txt'));

function checkInput() {
  stdout.write('Введите текст и нажмите Enter. Для выхода нажмите Ctrl+C либо введите exit:\n');
  stdin.on('data', data => {
    if (data.toString().includes('exit')) {
      process.exit();
    } else {
      output.write(data);
    }
  });
}
checkInput() 

process.on('exit', () => stdout.write('Спасибо, ваш текст записан!'));
process.on('SIGINT', () => process.exit());