import * as THREE from 'three'

export class WheelProcedural extends THREE.Object3D {
  public object: THREE.Mesh

  constructor(wheelModel: THREE.Mesh) {
    super()

    this.object = wheelModel.clone()
    this.add(this.object)
  }

  resize(wheelDiameter = 70, treadWidth = 20, rimDiameter = 40, bevelSize = 2) {
    let geometry: THREE.BufferGeometry = this.object.geometry
    let positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute
    let colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute

    console.log(positionAttribute, colorAttribute)
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
        vertex.y = (treadWidth / 2 - bevelSize) * side * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((wheelDiameter / 2) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      // Sidewall
      if (color.equals(new THREE.Color(THREE.Color.NAMES.blue))) {
        const side = Math.sign(vertex.y)
        vertex.y = (treadWidth / 2) * side * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((wheelDiameter / 2 - bevelSize) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      if (color.equals(green)) {
        vertex.y = (treadWidth / 2) * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((rimDiameter / 2) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      // Inner bevel
      if (color.equals(yellow)) {
        vertex.y = (treadWidth / 2 - bevelSize * 5) * unitScale

        const vertexVec = new THREE.Vector2(vertex.x, vertex.z).normalize()
        vertexVec.multiplyScalar((rimDiameter / 2 - bevelSize) * unitScale)
        vertex.x = vertexVec.x
        vertex.z = vertexVec.y
      }

      // Write the new position back to the attribute
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    positionAttribute.needsUpdate = true
    this.object.geometry.attributes.position.needsUpdate = true
  }
}
