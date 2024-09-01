import { test, describe, assert } from "vitest";
import { HistoricPrice, parsePrice } from "./historicPrice";

describe('parse price with currency', () => {
  const testCases = [
    ['200$', [200, 'dollar']],
    ['$201', [201, 'dollar']],
    ['$201.20', [201.20, 'dollar']],
    ['200.5$', [200.5, 'dollar']],
    ['2,500$', [2500, 'dollar']],
    ['2,500,000$', [2500000, 'dollar']],
    ['2 500$', [2500, 'dollar']],
    ['99f', [99, 'franc']],
    ['99baz', [null, 'unknow']], // unknow devise
  ]


  test.each(testCases)('should correctly parse "%s" to "%s"', (input, expected) => {
    const result = parsePrice(input);
    assert.deepEqual(result, expected);
  })
})

describe('historicPrice', () => {
  const testCases = [
    [['335$', 1922], [17175, 'dollar']],
  ]
  test.each(testCases)('should correctly parse "%s" to "%s"', (input, expected) => {
    const result = HistoricPrice(input[0], input[1]);
    assert.deepEqual(result, expected);
  })
})