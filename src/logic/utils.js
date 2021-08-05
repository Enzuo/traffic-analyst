function createTicker() {
  let lastTick = 0
  return {
    tickInterval : (interval, t, cb) => {
      if(t - lastTick >= interval){
        lastTick = t
        if(cb) {
          cb()
        }
        return true
      }
      return false
    }
  }
}

export default {
  createTicker,
}