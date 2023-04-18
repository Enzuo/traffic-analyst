import { SVG } from '@svgdotjs/svg.js'


export function createTrafficGraph (container, cars) {
  const SCALE = 2
  const carEntities = {}
  let selectedCarId


  let canvasWidth = container.offsetWidth
  let canvasHeight = container.offsetHeight
  let svggraph = SVG().addTo(container).size(canvasWidth, canvasHeight)

  // background grid
  let background = svggraph.rect(canvasWidth, canvasHeight)
  const gridSize = 25 
  var pattern = svggraph.pattern(gridSize*SCALE,canvasHeight, function(add) {
    add.rect(gridSize*SCALE,canvasHeight).stroke('#ddd').fill('none')
  }).move(0,0)
  background.fill(pattern)


  function animate () {
    cars.forEach((car) => {
      let carEntity = carEntities[car.id]

      if(!carEntity){
        const circleSize = 10
        const carLength = 4.1
        const carWidth = 1.8
        
        let group = svggraph.group()
        let selectCircle = group.circle(circleSize * SCALE)
          .stroke('none').fill({ color: 'red' })
          .move(-circleSize/2 * SCALE,-circleSize/2 * SCALE)
        let carBox = group.rect(carLength * SCALE, carWidth * SCALE)
          .stroke('#000').fill({ color: 'red' })
          .move(-carLength/2 * SCALE, -carWidth/2 * SCALE)

        group.click(function() {
          handleCarClick(car)
          // onCarClick(car.id)
          selectCircle.fill({ color: 'rgba(255, 255, 0, 0.30)' })
        })

        carEntity = carEntities[car.id] = {group, carBox, selectCircle}
      }

      // variable color
      let red = 125 + Math.floor(125 * car.state.brakeInput)
      let green = 125 + Math.floor(255 * car.state.throttleInput)
      carEntity.carBox.fill({ color: 'rgb('+ red +',' + green +',0)' })
      if(car.id !== selectedCarId){
        carEntity.selectCircle.fill({ color: 'rgba(255, 255, 0, 0.03)'})
      }

      carEntity.group.move(car.state.position*SCALE, 5)
    })
  }

  function handleCarClick(car){
    selectedCarId = car.id  
    container.dispatchEvent(new CustomEvent('carClick',{
      detail: {
        id: selectedCarId,
      },
    }))
  }

  let cancelLoopHandler
  function runLoop (t) {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    animate()
  }

  runLoop()
  // animate()
}