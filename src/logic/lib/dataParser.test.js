import { assert, describe, test } from "vitest";
import { parseDate } from "./dataParser"

describe('parse car date format', () => {
  const testCases = [
    ['2019-2022', [2019, 2022]],
    ['2020', [2020, 2020]],
    ['2007 - 2022', [2007, 2022]],
    ['1998- 2002', [1998, 2002]],
    ['2020 - 2000', [2000, 2020]],
    // [2012, [2012, 2012]],
    [' 2002, 2010 ', [2002, 2010]],
    [' produced from  2001 to 2010 ', [2001, 2010]],
  ]


  test.each(testCases)('should correctly parse "%s" to "%s"', (input, expected) => {
    const result = parseDate(input);
    assert.deepEqual(result, expected);
  })
})