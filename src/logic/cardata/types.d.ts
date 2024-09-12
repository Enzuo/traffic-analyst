declare global {
  interface CarDataRaw {
    /* general */
    id: string
    name?: string
    brand?: string
    trim?: string
    year?: number | string
    unitsProduced?: number | string
    price?: number | string
    keywords?: string
    appearances?: string

    /* dimensions */
    weight?: number
    length?: number
    width?: number
    height?: number
    dragCoef?: number
    dragArea?: number
    wheelbase?: number
    bodyType?: string
    clearance?: number
    trunk?: number
    trunkMax?: number
    seats?: number

    /* components */
    configs?: Config[]
    engine?: Engine|string
    engines?: Engine[]
    gearbox?: Gearbox
    wheelDiameter?: number
    type?: string
    gearboxes?: Gearbox[]

    /* infos */
    acc0100?: number
    vmax?: number
    avgConsumption?: number | string
    energyTank?: number
    autonomy?: number
    turningCircle?: number
    wheelType?: string

    /* plane specific */
    groundRoll?: number
    takeOffSpeed?: number
    wingArea?: number
    liftDragRatio?: number

    /* model */
    model?: string
    modelWheel?: string
    modelMisc?: string
    wheelScale?: string
    modelLights?: string

    /* subtrims */
    trims?: Trim[]
    options?: unknown
  }

  interface Trim {
    trim: string
    [key: string]: unknown // any surcharge we want
  }

  interface Gearbox {
    name: string
    gearRatio: number[]
    reverseRatio?: number
    transferRatio?: number[]
    driveRatio?: number
  }

  interface Engine {
    name: string
    power?: number | string
    spec?: string
    torqueY?: number[]
    torqueX?: number[]
    type?: string
    layout?: string
    displacement?: number
  }

  interface Config {
    engine?: string | Engine
    gearbox?: string | Gearbox
    [key: string]: unknown // any surcharge we want
  }
}

export {}
