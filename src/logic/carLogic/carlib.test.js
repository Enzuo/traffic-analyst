import { convertQty, parseEngineSpec } from "./carlib"
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

describe('convert unit', () => {
  test('string value', () => {
    let qty = convertQty('100hp')
    assert.equal(qty.value.toFixed(2), '74.57')
    assert.equal(qty.unit, 'kw')

    qty = convertQty('100.0hp')
    assert.equal(qty.value.toFixed(2), '74.57')
    assert.equal(qty.unit, 'kw')
  })

  describe('convert from default unit', () => {
    test('no specified unit', () => {
      let qty = convertQty(74.57, 'hp')
      assert.equal(qty.value.toFixed(2), '100.00')
      assert.equal(qty.unit, 'hp')
    })

    test('string value', () => {
      let qty = convertQty(74.57, 'hp')
      assert.equal(qty.value.toFixed(2), '100.00')
      assert.equal(qty.unit, 'hp')
    })

    test('default from unit provided', () => {
      let qty = convertQty(74.57, 'hp', 'kw')
      assert.equal(qty.value.toFixed(2), '100.00')
      assert.equal(qty.unit, 'hp')
    })

    test('to third unit kw -> bhp', () =>  {
      let qty = convertQty('74.57kw', 'bhp')
      assert.equal(qty.value.toFixed(2), '101.34')
      assert.equal(qty.unit, 'bhp')
    })
  })


  describe('convert betwwen 2 different units than default', () => {
    test('from string', () => {
      let qty = convertQty('100bhp', 'hp')
      assert.equal(qty.value.toFixed(2), '98.68')
      assert.equal(qty.unit, 'hp')
    })

    test('from number bhp -> hp', () => {
      let qty = convertQty(100, 'hp', 'bhp')
      assert.equal(qty.value.toFixed(2), '98.68')
      assert.equal(qty.unit, 'hp')
    })

    test('from number hp -> bhp', () => {
      let qty = convertQty(100, 'bhp', 'hp')
      assert.equal(qty.value.toFixed(2), '101.34')
      assert.equal(qty.unit, 'bhp')
    })
  })


  describe('handle edge cases', () => {
    test('string with no unit', () => {
      let qty = convertQty('74.57', 'hp')
      assert.equal(qty.value.toFixed(2), '100.00')
      assert.equal(qty.unit, 'hp')
    })

    test('small integer', () => {
      let qty = convertQty('8hp', 'hp')
      assert.equal(qty.value.toFixed(2), '8.00')
      assert.equal(qty.unit, 'hp')
    })
  })




})