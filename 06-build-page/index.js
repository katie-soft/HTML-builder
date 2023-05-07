fs = require('fs');
path = require('path');

//create folders & streams
fs.mkdir(path.join(__dirname, 'project-dist', 'assets'), { recursive: true }, () => {});
console.log('step 1')

const inputHTML = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
const outputHTML = fs.createWriteStream(path.join(__dirname, 'project-dist', 'index.html'));
const outputCSS = fs.createWriteStream(path.join(__dirname, 'project-dist', 'style.css'));

console.log('step 4')

//copy assets
function copyDir(source, target) {
  function handleError(err) {
    if (err) throw err;
  }

  function createFiles() {
    fs.readdir(path.join(source), (err, files) => {
      if (err) {
        console.log('1', err);
      } else {
        files.forEach(file => {
        fs.copyFile(path.join(source, file), path.join(target, file), handleError);
        })
      }
    });
  }

  function deleteFiles(folder) {
    fs.readdir(path.join(folder), (err, files) => {
      if (err) {
        console.log('2', err);
      } else {
        files.forEach(file => {
          fs.unlink(path.join(folder, file), handleError);
        })
      }
    });
  }

  fs.stat(path.join(target), () => {
      //deleteFiles(target);
      createFiles();
  })
}

//copyDir(path.join(__dirname, 'assets', 'img'), path.join(__dirname, 'project-dist', 'assets', 'img'), err => console.log('3', err));

//build styles
fs.readdir(path.join(__dirname, 'styles'), (error, files) => {
  if (error) {
    console.log('styles - ', error);
  } else {
    files.forEach(file => {
      fs.stat(path.join(__dirname, 'styles', file), (error, stats) => {
        if (error) {
          console.log('forEach - ', error);
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

//replace tags in HTML
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

const regex = /({{[a-z]+}})/g;
let data = '';
inputHTML.on('data', chunk => data += chunk);

inputHTML.on('end', () => {
  let tags = data.match(regex);
  
  addToObj(tags).then((tagObj) => { 
    let newData = replaceTags(data, tagObj);
    outputHTML.write(newData);
  });
});

inputHTML.on('error', error => console.log('read error - ', error));
//outputHTML.on('error', error => console.log('write error - ', error));