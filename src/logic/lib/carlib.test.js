import { parseEngineSpec, parseTireCode } from "./carlib"
import { describe, expect, test, assert } from 'vitest'


test('can process empty engine spec', () => {
  const spec = ''
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([])

})

test('can process engine spec hp', () => {
  const spec = '245nm@1750 109hp@4000'
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([
    [ 1000, 171.5 ],
    [ 1750, 245 ],
    [ 4000, 191.38431361218753 ]
  ])
})

test('can process engine spec hp (uppercase)', () => {
  const spec = '145NM@4000 78kw@5500'
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([
    [ 1000, 101.5 ],
    [ 4000, 145 ],
    [ 5500, 135.42218181818183 ]
  ])
})

test('can process engine spec hp (reversed rpm)', () => {
  const spec = '60hp@4500 145nm@2500'
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([
    [ 1000, 101.5 ],
    [ 2500, 145 ],
    [ 4500, 93.64370085 ]
  ])
})


describe('tire codes', () => {
  const testCases = [
    ['205/55R16', [ 63, 21, 41 ]],
    ['80/45r12', [ 38, 8, 30 ]],
  ]

  test.each(testCases)('should correctly parse "%s" to "%s"', (input, expected) => {
    const result = parseTireCode(input);
    assert.deepEqual(result.map(a => Math.round(a)), expected);
  })
})