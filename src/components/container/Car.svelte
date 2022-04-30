<script>
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'

  let carId = 'renault_zoe'

  let car = cardata.getCar(carId)

  let carAccSim = Simulation()

  carAccSim.addAnimate((t, dt) => {
    console.log('anim', dt)
  })

  carAccSim.start()

  console.log(car)

</script>

