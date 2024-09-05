import  fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import jsonToTs from 'json-to-ts'

const DATA_PATH = 'data'

let carYaml = fs.readFileSync(path.join(DATA_PATH, 'cars', '_default.yaml'), 'utf-8')
let carJson = yaml.parse(carYaml)
let carType = jsonToTs(carJson)

const tsOutput = carType.join('\n\n');

// TODO if file already exists, compare the types
fs.writeFileSync(path.join('src/logic/cardata', 'types.d.ts'), tsOutput);
