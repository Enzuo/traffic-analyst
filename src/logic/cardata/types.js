/**
 *
 *                   CarData
 *
 *
 * @typedef {object} CarData raw car data as expressed in data files, readable data format.
 * @property {string} name
 * @property {string} brand
 * @property {string} trim
 * @property {string} year // production year range 2010-2020
 * @property {number} unitsProduced
 * @property {string} price
 * @property {string} keywords // related, keys, words
 *
 * ENGINES
 * @property {engine} engine
 *
 * TRANSMISSION
 * @property {gearbox} gearbox
 * @property {string} type // transmission type AWD, RWD, FWD
 * @property {number} wheelDiameter // wheel diameter in cm
 *
 * CONFIGS
 * list of avaiablable configs
 * @property {CarConfig[]} configs
 *
 * DIMENSIONS
 * @property {number} weight // kg
 * @property {number} length // mm
 * @property {number} width // mm
 * @property {number} height // mm
 * @property {number} wheelbase // mm
 * @property {number} clearance // mm
 * @property {number} dragCoef
 * @property {number} dragArea // m2
 * @property {string} bodyType // suv, hatchback, sedan, ...

 * STATS
 * @property {number} trunk // trunk size in L
 * @property {number} trunkMax // max trunk size in L
 * @property {number} seats
 * @property {number} doors
 * @property {number} acc0100 // constructor stats
 * @property {number} vmax // constructor vmax
 * @property {number} avgConsumption // constructor avg consumption
 * @property {number} energyTank // L or KW
 * @property {number} autonomy // avg autonomy on one energy tank in km
 * @property {number} turningCircle // m
 * @property {string} wheelType //
 *
 * PLANE STATS
 * @property {number} groundRoll
 * @property {number} takeOffSpeed
 * @property {number} wingArea
 * @property {number} liftDragRatio
 *
 * 3D
 * @property {string} model
 * @property {string} modelWheel
 * @property {string} modelMisc
 * @property {number} wheelScale
 * @property {Array} modelLights
 *
 * @property {CarTrim[]} trims
 * @property {options[]} options
 * @property {engine[]=} engines list all additional available engines
 * @property {gearbox[]=} gearboxes list all additional available gearboxes
 * @property {string} id
 */

/**
 * @typedef {object} engine
 * @property {string} name
 * @property {number} hp
 * @property {string} spec // 60hp@5000 130nm@3000
 * @property {Array<number>} torqueY
 * @property {Array<number>} torqueX
 * @property {string} type // petrol, diesel
 * @property {string} layout // v8, l4
 * @property {number} displacement // cm3
 */

/**
 * @typedef {object} gearbox
 * @property {string} name
 * @property {Array<number>} gearRatio
 * @property {number|Array<number>} reverseRatio
 * @property {number|Array<number>} transferRatio // additional HI-LOW gear ratios
 * @property {number} driveRatio
 */

/**
 * @typedef {object} CarTrim
 * @property {?} trim
 * @property {CarConfig[]} configs
 * ... all other CarData values we want to ovveride
 */

/**
 * @typedef {object} options
 * @property {?} name
 */

/**
 * @typedef {object} CarConfig
 * @property {string} engine engine name
 * @property {string} gearbox gearbox name
 * ... and all other CarData values we want to ovveride, default values -> trim values -> config values
 */
