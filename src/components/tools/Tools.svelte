<script>
  import { getSpeedForRPM } from "@/logic/lib/carlib"
  let gearSpeed = ''
  let driveRatio = 4
  let wheelSize = 63
  let rpm = 0
  let gearRatios = 0

  function handleRatioChange(e){
    let ratios = e.target.value
    ratiosToSpeeds(ratios)
  }

  function ratiosToSpeeds(ratios){
    let ratiosArray = ratios.split(',')
    let speedArray = []
    for(let i=0; i<ratiosArray.length; i++){
      let ratio = parseFloat(ratiosArray[i])
      console.log('drive ratio', driveRatio)
      let speed = getSpeedForRPM(rpm, ratio, driveRatio, wheelSize)
      speedArray.push((speed * 3.6).toFixed(1))
    }
    gearSpeed = speedArray.join(', ')
  }
</script>



<div class="grid">
  <label for="rpm">RPM <input id="rpm" value={rpm}></label>
  <label for="gear-ratio">GearRatios <input id="gear-ratio" value={gearRatios} on:input={handleRatioChange}></label>
  <label for="gear-speed">GearSpeed <input id="gear-speed" value={gearSpeed}></label>
  <label for="drive-ratio">DriveRatio <input id="drive-ratio" type="number" bind:value={driveRatio}></label>
  <label for="wheel-diameter">WheelDiameter <input id="wheel-diameter" type="number" placeholder="cm" bind:value={wheelSize}></label>
</div>