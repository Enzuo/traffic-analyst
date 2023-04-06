import { getCar } from '@/logic/cardata';
import { createCar, updateForces } from '../logic/carLogic/carEntity'

test('functional updateForces', () => {
  let zoe = createCar(getCar('renault_zoe'))
  let zoeBefore = zoe
  let zoeAfter = updateForces(zoe)
  expect(zoe).toBe(zoeBefore);
  expect(zoe).not.toBe(zoeAfter);
});