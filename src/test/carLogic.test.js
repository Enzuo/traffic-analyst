import { getCar } from '@/logic/cardata';
import { CarEntity, updateForces } from '../logic/trafficsim/CarEntity'
import { describe, it, expect, test } from 'vitest';


test('functional updateForces', () => {
  let zoe = new CarEntity(getCar('renault_zoe'))
  let zoeBefore = zoe
  let zoeAfter = updateForces(zoe)
  expect(zoe).toBe(zoeBefore);
  expect(zoe).not.toBe(zoeAfter);
});