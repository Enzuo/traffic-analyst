const fs = require('fs')
const path = require('path')
const toml = require('toml');


let cars = fs.readdirSync(path.join(__dirname, 'data', 'cars'))
let engines = fs.readdirSync(path.join(__dirname, 'data', 'engines'))

let folderPath = path.join(__dirname, 'data', 'cars')
for(let i=0; i<cars.length; i++){
  let car = fs.readFileSync(path.join(folderPath, cars[i]), 'utf-8')
  let carJSON
  try {
    carJSON = toml.parse(car)

  } catch (e) {
    console.error("Parsing error on line " + e.line + ", column " + e.column +
      ": " + e.message);
  }

  console.log(carJSON)
}

console.log(cars)