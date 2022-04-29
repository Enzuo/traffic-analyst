const fs = require('fs')
const path = require('path')
const yaml = require('yaml');

const folders = ['cars','engines']

let database = {}

for(let i=0; i<folders.length; i++){
  let folder = folders[i]
  let folderPath = path.join(__dirname, 'data', folder)
  let folderFiles = fs.readdirSync(folderPath)
  database[folder] = []
  
  for(let j=0; j<folderFiles.length; j++){
    let fileContent = fs.readFileSync(path.join(folderPath, folderFiles[j]), 'utf-8')

    let fileParsed
    try {
      fileParsed = yaml.parse(fileContent)
  
    } catch (e) {
      console.error("Parsing error on line " + e.line + ", column " + e.column +
        ": " + e.message);
    }
    // add unique id based on filename (which should be unique)
    let id = path.basename(folderFiles[j], '.yaml')
    fileParsed['id'] = id

    database[folder].push(fileParsed)
  }
}

fs.writeFileSync(path.join(__dirname,  'database.json'), JSON.stringify(database, null, 2))