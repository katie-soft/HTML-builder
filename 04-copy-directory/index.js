const { copyFile } = require('fs');

fs = require('fs');
path = require('path');

function copyDir(source, target) {
  function handleError(err) {
    if (err) throw err;
  }

  function createFiles() {
    fs.readdir(path.join(__dirname, source), (err, files) => {
      if (err) {
        console.log(err);
      } else {
        files.forEach(file => {
          copyFile(path.join(__dirname, source, file), path.join(__dirname, target, file), handleError);
        })
      }
    });
  }

  function deleteFiles(folder) {
    fs.readdir(path.join(__dirname, folder), (err, files) => {
      if (err) {
        console.log(err);
      } else {
        files.forEach(file => {
          fs.unlink(path.join(__dirname, folder, file), handleError);
        })
      }
    });
  }

  fs.stat(path.join(__dirname, target), (err) => {
    if (!err) {
      deleteFiles(target);
      createFiles();
    }
    else if (err.code === 'ENOENT') {
      fs.mkdir(path.join(__dirname, target), handleError);
      createFiles();
    }
  })
}

copyDir('files', 'copy-files');
