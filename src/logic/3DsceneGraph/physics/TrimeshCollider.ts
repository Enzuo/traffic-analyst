import * as CANNON from 'cannon'
import * as THREE from 'three'
import type {Object3D} from 'three'
import { threeToCannon } from '@/logic/lib/three-to-cannon'

export class TrimeshCollider
{
	public mesh: any;
	public options: any;
	public body: CANNON.Body;
	public debugModel: any;

	constructor(mesh: Object3D, options: any)
	{
		this.mesh = mesh.clone();

		let defaults = {
			mass: 0,
			position: mesh.position,
			rotation: mesh.quaternion,
			friction: 0.3
		};
		options = Object.assign({}, options, defaults)
		this.options = options;

		let mat = new CANNON.Material('triMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		let shape = threeToCannon(this.mesh, {type: threeToCannon.Type.MESH});
		// shape['material'] = mat;

		// Add phys sphere
		let physBox = new CANNON.Body({
			mass: options.mass,
			position: options.position,
			quaternion: options.rotation,
			shape: shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}