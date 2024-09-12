import {search, flattenCarData} from '@/logic/cardata/database'
import { describe, it, expect, test } from 'vitest';

import { TEST_CARDATA  } from './cardata.test';


test.only('creating standalone cars from data files' , () => {
  let result = flattenCarData(TEST_CARDATA)
  console.log(result)
  // search('clio', example_data)
})