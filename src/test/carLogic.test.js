import { getCar } from '@/logic/cardata';
import { createCar, updateForces } from '../logic/carphysics/carEntity'

test('adds 1 + 2 to equal 3', () => {
  let zoe = createCar(getCar('renault_zoe'))
  let zoeAfter = updateForces(zoe)
  expect(zoe).not.toBe(zoeAfter);
});