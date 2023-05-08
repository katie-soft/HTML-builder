fs = require('fs');
path = require('path');

//create folders & streams
fs.mkdir(path.join(__dirname, 'project-dist', 'assets'), { recursive: true }, () => {
  console.log('start building page');
  createStreams();
  createCSS();
  createHTML();
  copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'), err => console.log('3', err));
});

let inputHTML,outputHTML, outputCSS = {};

function createStreams() {
  console.log('step streams start')
  inputHTML = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
  outputHTML = fs.createWriteStream(path.join(__dirname, 'project-dist', 'index.html'));
  outputCSS = fs.createWriteStream(path.join(__dirname, 'project-dist', 'style.css'));
  console.log('step streams finished')
}

//copy assets
function createDir(source, target) {
  fs.readdir(path.join(source), ((error, folders) => {
    if (error) {
      console.log('dir - ', error);
    } else {
      folders.forEach(folder => fs.mkdir(path.join(target, folder), () => {
        console.log('folder created');
        fs.readdir(path.join(source, folder), ((error, files) => {
          if (error) {
            console.log('file - ', error)
          } else {
            files.forEach(file => fs.copyFile(path.join(source, folder, file), path.join(target, folder, file), (error) => console.log('file created')))
          }
        }))
      }))      
    }
  }))
}

function deleteFiles(folder) {
  fs.readdir(path.join(folder), (err, files) => {
    if (err) {
      console.log('delete -', err);
    } else {
      files.forEach(file => {
        fs.unlink(path.join(folder, file), (error) => console.log(error));
      })
    }
  });
}

function copyDir(source, target) {
  fs.stat(path.join(target), () => {
      createDir(source, target);
      //deleteFiles(target);
  })
}

//build styles
function createCSS() {
  console.log('step CSS start')
  fs.readdir(path.join(__dirname, 'styles'), (error, files) => {
    if (error) {
      console.log('styles - ', error);
    } else {
      files.forEach(file => {
        fs.stat(path.join(__dirname, 'styles', file), (error, stats) => {
          if (error) {
            console.log('styles - ', error);
          }
          if (stats.isFile() && path.parse(file).ext === '.css') {
            const stream = fs.createReadStream(path.join(__dirname, 'styles', file), 'utf-8');
            stream.on('data', chunk => outputCSS.write(chunk));
            stream.on('error', error => console.log(error.message));
          };
        });
      });
    }
  });
  console.log('step CSS finished')
}

//replace tags in HTML
const regex = /({{[a-z]+}})/g;
function readHTMLFile(path) {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(path, 'utf-8');
    let data = '';
    
    stream.on('data', chunk => data += chunk)
    
    stream.on('end', () => {
      resolve(data)
    })

    stream.on('error', () => {
      reject('read error')
    })
  })
}

async function addToObj(arr) {
  let obj = {};

  for (let key of arr) {
    await readHTMLFile(path.join(__dirname, 'components', `${key.slice(2, -2)}.html`))
      .then( (localData) => {
        obj[key] = localData;
      } )
    }

  return obj;
}

function replaceTags(str, obj) {
  for (let key in obj) {
    str = str.replace(key, obj[key]);
  }
  return str;
}

function createHTML() {
  console.log('step HTML start')
  let data = '';
  inputHTML.on('data', chunk => data += chunk);

  inputHTML.on('end', () => {
    let tags = data.match(regex);
  
  addToObj(tags).then((tagObj) => { 
    let newData = replaceTags(data, tagObj);
    outputHTML.write(newData);
    });
  });
  console.log('step HTML finish')
  inputHTML.on('error', error => console.log('read error - ', error));

}