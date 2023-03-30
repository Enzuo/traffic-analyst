<script>
  import { getSpeedForRPM } from "@/logic/carphysics/physics"

  let rpm = 1000
  let gearRatios = '1'
  let gearSpeed = ''
  let driveRatio = 4
  let wheelSize = 63

  function handleRatioChange(e){
    let ratios = e.target.value
    ratiosToSpeeds(ratios)
  }

  function ratiosToSpeeds(ratios){
    let ratiosArray = ratios.split(',')
    let speedArray = []
    for(let i=0; i<ratiosArray.length; i++){
      let ratio = parseFloat(ratiosArray[i])
      let speed = getSpeedForRPM(rpm, ratio, driveRatio, wheelSize)
      speedArray.push((speed * 3.6).toFixed(1))
    }
    gearSpeed = speedArray.join(', ')
  }
</script>




RPM <input value={rpm}>
GearRatios <input value={gearRatios} on:input={handleRatioChange}>
GearSpeed <input value={gearSpeed}>
DriveRatio <input value={driveRatio}>
WheelDiameter <input value={wheelSize}> cm