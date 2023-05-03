fs = require('fs');
path = require('path');
const output = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

fs.readdir(path.join(__dirname, 'styles'), (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files.forEach(file => {
      fs.stat(path.join(__dirname, 'styles', file), (error, stats) => {
        if (error) {
          console.log(error);
        }
        if (stats.isFile() && path.parse(file).ext === '.css') {
          const stream = fs.createReadStream(path.join(__dirname, 'styles', file), 'utf-8');
          stream.on('data', chunk => output.write(chunk));
          stream.on('error', error => console.log(error.message));
        };
      });
    });
  }
});