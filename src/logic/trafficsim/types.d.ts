import type * as A from "./CarEntity";

// Making types global for ease of use, those types shape all the app (godot style)
declare global {
  interface CarEntity extends A.CarEntity {}
  interface SimulationScenario {
    name : string
    steps : Array<unknown>
  }
}