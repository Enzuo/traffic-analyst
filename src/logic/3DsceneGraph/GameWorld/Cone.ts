import * as CANNON from 'cannon-es'
import * as Utils from './Utils'
import { loadModel } from "@/logic/3DsceneGraph/loader"

export class Cone {

  public object
  public physicBody
  public weight = 3.2


  constructor (scene, physicsWorld) {
    loadModel('assets/cone75').then(glb => {
      this.object = glb.scene.children[0]

      console.log('object', this.object)
      // calc bounding box
      let sizeX = this.object.geometry.boundingBox.max.x - this.object.geometry.boundingBox.min.x
      let sizeY = this.object.geometry.boundingBox.max.y - this.object.geometry.boundingBox.min.y
      let sizeZ = this.object.geometry.boundingBox.max.z - this.object.geometry.boundingBox.min.z
      let offsetY = this.object.geometry.boundingBox.max.y - sizeY/2
      // create physics
      const weight = 3.2
      const shape = new CANNON.Box(new CANNON.Vec3(sizeX/2, sizeY/2, sizeZ/2))
      const material = new CANNON.Material('boxMat');
      material.friction = 0.3
      this.physicBody = new CANNON.Body({
        mass: weight,
        position: new CANNON.Vec3(3, 3, 0),
        material : material,
      });
      this.physicBody.addShape(shape, new CANNON.Vec3(0,offsetY,0))

      physicsWorld.addBody(this.physicBody)
      scene.add(this.object)
    })
  }

  animate(delta){
    if(!this.physicBody) return
    this.object.position.copy(Utils.threeVector(this.physicBody.position))
    this.object.quaternion.copy(Utils.threeQuat(this.physicBody.quaternion))
  }


}