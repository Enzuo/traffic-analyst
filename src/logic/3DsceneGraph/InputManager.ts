export class InputManager {

  public inputReceiver
  public domElement : HTMLElement
  public gamepads = []
  public gamepadInputMap
  public animationFrameHandler

  constructor(domElement : HTMLElement) {


    this.domElement = domElement
    document.addEventListener('keydown', (e) => this.onKeyboardInput(e), false);
    document.addEventListener('keyup', (e) => this.onKeyboardInput(e, false), false);

    window.addEventListener("gamepadconnected", (e) => {
      console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length
      );
      const gp = navigator.getGamepads()[e.gamepad.index];
      this.gamepads.push(gp)
      console.log('buttons', gp.buttons)

      // Start input loop
      if(!this.animationFrameHandler){
        this.inputLoop()
      }
    });
  }

  inputLoop() {
    this.animationFrameHandler = requestAnimationFrame(() => this.inputLoop())


    const gamepads = navigator.getGamepads();
    if (!gamepads) {
      return;
    }

    // console.log(gamepads)

    // check gamepads button press
    this.gamepadInputMap = {}
    gamepads.forEach((gp) => {
      if(!gp) return
      gp.buttons.forEach((b,index) => {
        let val = gamePadButtonPressed(b, index)
        if(val) this.updateGampepadInputMap(index, val)
      })
    })
    if(this.inputReceiver){
      this.inputReceiver.updateActions(this.gamepadInputMap)
    }

  }

  onKeyboardInput(event, isPressed=true){

    let actionName
    let value

    switch(event.code){
      case 'ArrowUp':
      case 'KeyW':
        actionName = 'up'
        break
      case 'ArrowLeft':
        actionName = 'left'
        break
      case 'ArrowRight':
        actionName = 'right'
        break
      case 'ArrowDown':
        actionName = 'down'
        break
    }



    if(this.inputReceiver){
      this.inputReceiver.triggerAction(actionName, isPressed, value)
    }
  }

  updateGampepadInputMap(buttonIndex, val) {
    let actionName
    let value

    switch(buttonIndex){
      case 7 :
      case 12 :
        actionName = 'up'
        value = val
        break;
    }

    this.gamepadInputMap[actionName] = value
  }
}


function gamePadButtonPressed (b, index) {
  if(b.pressed){
    console.log(index, b.value)
    return b.value
  }
  return null
}

// class Gamepad {
//   public pressedButtons = {}

//   constructor () {

//   }

//   update (gp) {
//     gp.buttons.forEach((b,index) => {
//       if(b.pressed){
//         this.pressedButtons[index] = true
//       }
//       let val = gamePadButtonPressed(b, index)
//       if(val) this.onControllerInput(index, val)
//     })


//   }


// }