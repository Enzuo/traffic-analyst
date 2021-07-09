export function Simulation () {
  let elapsedTime = 0
  
  const forward = (t : DOMHighResTimeStamp) => {
    elapsedTime = t
  }

  const currentState = () => {
    return {
      elapsedTime
    }
  }

  return {
    forward,
    currentState
  }    
}