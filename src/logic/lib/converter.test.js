import { convertQty } from './converter'
import { describe, test, assert } from 'vitest'


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
  })




})