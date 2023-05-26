export class InputManager {

  public inputReceiver
  public domElement : HTMLElement

  constructor(domElement : HTMLElement) {


    this.domElement = domElement
    document.addEventListener('keydown', (e) => this.onInput(e), false);
    document.addEventListener('keyup', (e) => this.onInput(e, false), false);

  }

  onInput(event, isPressed=true){

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



}