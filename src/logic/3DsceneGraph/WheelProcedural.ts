import * as THREE from 'three'
import { loadModel } from './loader'

export class WheelProcedural extends THREE.Object3D {
  public object: THREE.Mesh
  public objectRim

  public wheelDiameter = 70
  public treadWidth = 20
  public rimDiameter = 40
  public bevelSize = 2

  constructor(wheelModel: THREE.Mesh) {
    super()
    this.addRim()
    this.object = wheelModel.clone()
    //this.resize()
    this.add(this.object)
  }

  async addRim(){
    const rimGLB = await loadModel('rimDefault')
    const objectRim = rimGLB.scene.children[0]
    this.objectRim = objectRim
    this.add(objectRim)
    this._resize()
  }

  resize(wheelDiameter = 70, treadWidth = 20, rimDiameter = 40) {
    this.wheelDiameter = wheelDiameter
    this.treadWidth = treadWidth
    this.rimDiameter = rimDiameter
    this._resize()
  }

  _resize(){
    let geometry: THREE.BufferGeometry = this.object.geometry
    let positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute
    let colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute

    console.log('resize wheel', this.wheelDiameter, this.treadWidth, this.rimDiameter)
    const unitScale = 0.01
    const green = new THREE.Color(0, 1, 0)
    const yellow = new THREE.Color(1, 1, 0)

    const vertex = new THREE.Vector3()
    const color = new THREE.Color()
    for (let i = 0; i < positionAttribute.count; i++) {
      // Read the current vertex position
      vertex.fromBufferAttribute(positionAttribute, i)
      color.fromBufferAttribute(colorAttribute, i)

      // Tread (rolling band)
      if (color.equals(new THREE.Color(THREE.Color.NAMES.red))) {
        const side = Math.sign(vertex.y)
        vertex.y = (this.treadWidth / 2 - this.bevelSize) * side * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((this.wheelDiameter / 2) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      // Sidewall
      if (color.equals(new THREE.Color(THREE.Color.NAMES.blue))) {
        const side = Math.sign(vertex.y)
        vertex.y = (this.treadWidth / 2) * side * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((this.wheelDiameter / 2 - this.bevelSize) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      if (color.equals(green)) {
        vertex.y = (this.treadWidth / 2) * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((this.rimDiameter / 2) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      // Inner bevel
      if (color.equals(yellow)) {
        vertex.y = (this.treadWidth / 2 - this.bevelSize * 5) * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((this.rimDiameter / 2 - this.bevelSize) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      // Write the new position back to the attribute
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    positionAttribute.needsUpdate = true
    this.object.geometry.attributes.position.needsUpdate = true

    // Adjust rim on the wheel
    if(this.objectRim){
      this.objectRim.position.set(this.treadWidth/2 * unitScale, 0, 0)
      const scale = calcWheelScale(this.rimDiameter, this.objectRim)
      const isRightWheel = false
      this.objectRim.scale.set(isRightWheel ? -scale : scale, scale, scale)
    }
  }
}


/**
 *
 * @param {number} wheelDiameter {cm}
 * @param {THREE.Object3D} wheel
 * @returns {number} scale
 */
function calcWheelScale(wheelDiameter, wheel){
  const modelDiameter = wheel.geometry.boundingBox.max.z * 2 * 100
  return wheelDiameter ? wheelDiameter/modelDiameter : 1
}