declare global {
  interface CarDataRaw {
    id: string
    name: string
    brand: string
    trim: string
    year: number | string
    unitsProduced: number | string
    price: number | string
    keywords: string
    appearances: string
    weight: number
    length: number
    width: number
    height: number
    dragCoef: number
    dragArea: number
    wheelbase: number
    bodyType: string
    clearance: number
    trunk: number
    trunkMax: number
    seats: number
    configs: Config[]
    engine: Engine
    engines: Engine[]
    gearbox: Gearbox
    wheelDiameter: number
    type: string
    gearboxes: Gearbox[]
    acc0100: number
    vmax: number
    avgConsumption: number | string
    energyTank: number
    autonomy: number
    turningCircle: number
    wheelType: string

    groundRoll: number
    takeOffSpeed: number
    wingArea: number
    liftDragRatio: number
    model: string
    modelWheel: string
    modelMisc: string
    wheelScale: string
    modelLights: string
    trims: Trim[]
    options: unknown
  }

  interface Trim {
    trim: string
    [key: string]: unknown
  }

  interface Gearbox {
    name: string
    gearRatio: number[]
    reverseRatio: number
    transferRatio: number[]
    driveRatio: number
  }

  interface Engine {
    name: string
    power: number | string
    spec: string
    torqueY: number[]
    torqueX: number[]
    type: string
    layout: string
    displacement: number
  }

  interface Config {
    engine: string | Engine
    gearbox: string | Gearbox
  }
}

export {}
