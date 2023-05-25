import { SVG } from '@svgdotjs/svg.js'
import zoeSvg from './zoe.svg?dataurl'
console.log(zoeSvg)



export function createTrafficGraph (container, cars) {
  const SCALE = 5
  const carObjects = []
  let selectedCarId


  let canvasWidth = container.offsetWidth
  let canvasHeight = container.offsetHeight
  let svggraph = SVG().addTo(container).size(canvasWidth, canvasHeight).viewbox(0,0,canvasWidth/SCALE,canvasHeight/SCALE)


  // background grid
  let background = svggraph.rect(canvasWidth, canvasHeight)
  const gridSize = 25
  var pattern = svggraph.pattern(gridSize,canvasHeight, function(add) {
    add.rect(gridSize,canvasHeight).stroke('#ddd').fill('none')
  }).move(0,0)
  background.fill(pattern)


  function animate () {
    cars.forEach((car) => {
      let carObject = carObjects.find(c => c.id === car.id)

      if(!carObject){
        carObject = createCarZoe(car, svggraph)

        carObject.group.click(function() {
          handleCarClick(car)
          carObject.selectCircle.fill({ color: 'rgba(255, 255, 0, 0.30)' })
        })

        carObjects.push(carObject)
      }

      // variable color
      let red = 125 + Math.floor(125 * car.state.brakeInput)
      let green = 125 + Math.floor(255 * car.state.throttleInput)
      carObject.carBox.fill({ color: 'rgb('+ red +',' + green +',0)' })
      if(car.id !== selectedCarId){
        carObject.selectCircle.fill({ color: 'rgba(255, 255, 0, 0.03)'})
      }

      carObject.group.move(car.state.position, 5)
    })

    // REMOVE
    if(cars.length !== carObjects.length){
      // find cars that was deleted
      let index = carObjects.findIndex(o => {
        let i = cars.findIndex(c => c.id === o.id)
        return i === -1
      })

      carObjects[index].group.remove()
      carObjects.splice(index, 1)
    }
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

function createCar(car, svggraph) {
  const circleSize = 10
  const carLength = 4.1
  const carWidth = 1.8

  let group = svggraph.group()
  let selectCircle = group.circle(circleSize)
    .stroke('none').fill({ color: 'red' })
    .move(-circleSize/2, -circleSize/2)
  let carBox = group.rect(carLength, carWidth)
    .stroke({color: '#000', width: 0.5}).fill({ color: 'red' })
    .move(-carLength/2, -carWidth/2)



  return {id : car.id, group, carBox, selectCircle}
}

function createCarZoe(car, svggraph) {
  const circleSize = 10
  const carLength = 4.1
  const carWidth = 1.8

  let group = svggraph.group()

  let selectCircle = group.circle(circleSize)
  .stroke('none').fill({ color: 'red' })
  .move(-circleSize/2, -circleSize/2)

  let carBox = group.image(zoeSvg)
  carBox.move(carLength/1.5, carWidth/2)
  carBox.scale(0.011)
  carBox.rotate(180)

  console.log('childs', carBox.children())



  return {id : car.id, group, carBox, selectCircle}
}