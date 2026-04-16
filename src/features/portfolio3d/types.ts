import { Camera } from "@babylonjs/core/Cameras/camera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { type ProjectConfig } from "@/data/projects";

export type CameraConfig = {
	rotationDegrees: number;
	tiltDegrees: number;
	distance: number;
	orthographicSize: number;
	targetYOffset: number;
	positionSmoothing: number;
	targetSmoothing: number;
	focusCatchUp: number;
	focusMaxDistance: number;
};

export type InteractableEntry = {
	mesh: Mesh;
	colliderMesh?: Mesh;
	config: ProjectConfig;
};

export type CameraFollowState = {
	camera: Camera & {
		getTarget?: () => Vector3;
		setTarget?: (target: Vector3) => void;
	};
	player: Mesh;
	config: CameraConfig;
	offset: Vector3;
	targetOffset: Vector3;
	focusPosition: Vector3;
	lookAhead: Vector3;
	lastPlayerPosition: Vector3;
	movementDirection: Vector3;
	elapsedTime: number;
};

export type InputState = {
	w: boolean;
	a: boolean;
	s: boolean;
	d: boolean;
	space: boolean;
};
