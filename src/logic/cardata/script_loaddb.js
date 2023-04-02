import  fs from 'fs'
import { fileURLToPath } from 'url';
import path from 'path'
import yaml from 'yaml'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FOLDERS = ['cars','engines']

let database = {}
let nb = 0
let nb_errors = 0

for(let i=0; i<DATA_FOLDERS.length; i++){
  let folder = DATA_FOLDERS[i]
  let folderPath = path.join(__dirname, '../../../data', folder)
  let folderFiles = fs.readdirSync(folderPath)
  database[folder] = []
  
  for(let j=0; j<folderFiles.length; j++){
    let fileContent = fs.readFileSync(path.join(folderPath, folderFiles[j]), 'utf-8')

    let fileParsed
    try {
      fileParsed = yaml.parse(fileContent)

      // add unique id based on filename (which should be unique)
      let id = path.basename(folderFiles[j], '.yaml')
      fileParsed['id'] = id

      database[folder].push(fileParsed)

      nb++
  
    } catch (e) {
      console.error("Parsing error on line " + e.line + ", column " + e.column + ": " + e.message)

      nb_errors++
    }

  }
}

console.log(`database updated with ${nb} entities ${nb_errors} errors`) 
fs.writeFileSync(path.join(__dirname,  'database.json'), JSON.stringify(database, null, 2))