import  fs from 'fs'
import { fileURLToPath } from 'url';
import path from 'path'
import yaml from 'yaml'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = '../../../data'
const DATA_FOLDERS = ['cars','engines']

let database = {}
let nb = 0
let nb_errors = 0
const VERBOSE = true
const COLOR = {
  red: '\x1b[31m',
  green : '\x1b[32m',
  yellow : '\x1b[33m',
  end : '\x1b[0m',
}

for(let i=0; i<DATA_FOLDERS.length; i++){
  let folder = DATA_FOLDERS[i]
  let folderPath = path.join(__dirname, DATA_PATH, folder)
  let folderFiles = fs.readdirSync(folderPath)
  database[folder] = []

  for(let j=0; j<folderFiles.length; j++){
    let fileContent = fs.readFileSync(path.join(folderPath, folderFiles[j]), 'utf-8')

    // add unique id based on filename (which should be unique)
    let id = path.basename(folderFiles[j], '.yaml')

    let fileParsed
    try {
      fileParsed = yaml.parse(fileContent)

      fileParsed['id'] = id

      database[folder].push(fileParsed)

      if(VERBOSE){
        console.log(`${COLOR.green}- ${id} ${COLOR.end}`)
      }

      nb++

    } catch (e) {
      console.error(`${COLOR.red}- ${id} -> Error line ${e.linePos[0].line} : ${e.message} ${COLOR.end}`)

      nb_errors++
    }

  }
}

console.log(`Database created : ${COLOR.green} ${nb} ${COLOR.end} entities / ${COLOR.red}${nb_errors ? nb_errors + ' errors' : ''}${COLOR.end}`)
fs.writeFileSync(path.join(__dirname,  'database.json'), JSON.stringify(database, null, 2))