fs = require('fs');
path = require('path');

fs.readdir(path.join(__dirname, 'secret-folder'), (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files.forEach(file => {
      fs.stat(path.join(__dirname, 'secret-folder', file), (error, stats) => {
        if (stats.isFile()) {
          console.log(`${path.parse(file).name} - ${path.parse(file).ext.slice(1)} - ${stats.size} bytes`);
        };
      });
    });
  }
});