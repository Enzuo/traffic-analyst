import {search, flattenCarData} from '@/logic/cardata/database'
import { describe, it, expect, test } from 'vitest';



const example_data = [{
  id : 'renault_clio2',
  name : 'clio 2',
  trim : '3 doors',
  brand : 'renault',
  year : 1999,
  engine : {
    name :'k7m',
    hp : 90,
  },
  weight: 1050,

  trims : [{
    trim : '5 doors',
    engines : [{
      engine : {
        name : 'm4r',
        hp : 70,
      },
    },
    {
      engine : {
        name : 'k7m'
      },
      weight : 1100,
    }]
  }]
}]



test.only('creating standalone cars from data files' , () => {
  let result = flattenCarData(example_data)
  console.log(result)
  // search('clio', example_data)
})