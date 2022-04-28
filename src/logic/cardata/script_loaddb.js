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

    database[folder].push(fileParsed)
  }
}

console.log(database)

fs.writeFileSync(path.join(__dirname,  'database.json'), JSON.stringify(database, null, 2))