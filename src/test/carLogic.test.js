import { getCar } from '@/logic/cardata';
import { createCarEntity, updateForces } from '../logic/carLogic/carEntity'

test('functional updateForces', () => {
  let zoe = createCarEntity(getCar('renault_zoe'))
  let zoeBefore = zoe
  let zoeAfter = updateForces(zoe)
  expect(zoe).toBe(zoeBefore);
  expect(zoe).not.toBe(zoeAfter);
});