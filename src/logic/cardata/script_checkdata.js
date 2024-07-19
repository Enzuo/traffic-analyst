import  fs from 'fs'
import { fileURLToPath } from 'url';
import path from 'path'
import yaml from 'yaml'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = '../../../data'
const DATA_FOLDERS = ['cars']
const DEFAULT_FILENAME = '_default.yaml'

const VERBOSE = true
const COLOR = {
  red: '\x1b[31m',
  green : '\x1b[32m',
  yellow : '\x1b[33m',
  end : '\x1b[0m',
}

main()

function  main() {
  // load default
  let defaultFileContent = fs.readFileSync(path.join(__dirname, DATA_PATH, DATA_FOLDERS[0], DEFAULT_FILENAME), 'utf-8')
  let defaultCar = yaml.parse(defaultFileContent)


  for(let i=0; i<DATA_FOLDERS.length; i++){
    let folder = DATA_FOLDERS[i]
    let folderPath = path.join(__dirname, '../../../data', folder)
    let folderFiles = fs.readdirSync(folderPath)

    for(let j=0; j<folderFiles.length; j++){
      let fileContent = fs.readFileSync(path.join(folderPath, folderFiles[j]), 'utf-8')

      let id = path.basename(folderFiles[j], '.yaml')

      // add unique id based on filename (which should be unique)
      let fileParsed
      try {
        fileParsed = yaml.parse(fileContent)

        console.log(j, id)
        checkCar(fileParsed, defaultCar)
      }
      catch(err){
        console.error(err)
      }
    }
  }
}

function checkCar(car, carDefault) {

  const keysCarDefault = Object.keys(carDefault);
  const keysCarDefaultSet = new Set(keysCarDefault)
  const keysCarToCheck = Object.keys(car);
  const keysCarToCheckSet = new Set(keysCarToCheck)


  const additionalKeys = keysCarToCheck.filter(key => !keysCarDefaultSet.has(key));
  if(additionalKeys){
    console.log(`${COLOR.green} additional key ${COLOR.end}`, additionalKeys)
  }

  const missingKeys = keysCarDefault.filter(key => !keysCarToCheckSet.has(key));
  if(additionalKeys){
    console.log(`${COLOR.red} missing key ${COLOR.end}`, missingKeys)
  }
}