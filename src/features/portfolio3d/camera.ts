import { Camera } from "@babylonjs/core/Cameras/camera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { type CameraConfig, type CameraFollowState } from "./types";

const MIN_ORTHOGRAPHIC_SIZE = 30;
const MAX_ORTHOGRAPHIC_SIZE = 220;
const ZOOM_STEP = 0.08;

// Configuracao base da camera.
// Mantemos um conjunto pequeno de parametros para uma camera
// ortografica/isometrica mais previsivel, inspirada em editores 3D.
export const ISOMETRIC_CAMERA_CONFIG: CameraConfig = {
	rotationDegrees: 45,
	tiltDegrees: 35.264,
	distance: 320,
	orthographicSize: 115,
	targetYOffset: 18,
	positionSmoothing: 7,
	targetSmoothing: 7,
	focusCatchUp: 8,
	focusMaxDistance: 10,
};

export function createCameraFollowState(
	camera: Camera,
	player: Mesh,
	config: CameraConfig = ISOMETRIC_CAMERA_CONFIG,
): CameraFollowState {
	const targetCamera = camera as CameraFollowState["camera"];

	const followState: CameraFollowState = {
		camera: targetCamera,
		player,
		config,
		offset: getCameraOffsetFromConfig(config),
		targetOffset: new Vector3(0, config.targetYOffset, 0),
		focusPosition: player.position.clone(),
		lookAhead: Vector3.Zero(),
		lastPlayerPosition: player.position.clone(),
		movementDirection: Vector3.Zero(),
		elapsedTime: 0,
	};

	applyCameraConfig(followState, config, true);
	return followState;
}

export function updateCameraFollow(
	follow: CameraFollowState,
	engine: Engine,
	deltaSeconds: number,
) {
	const frameMovement = follow.player.position.subtract(follow.lastPlayerPosition);
	if (frameMovement.lengthSquared() > 0.0001) {
		follow.movementDirection = Vector3.Lerp(
			follow.movementDirection,
			frameMovement.normalize(),
			Scalar.Clamp(deltaSeconds * 10, 0, 1),
		);
	}

	follow.lastPlayerPosition.copyFrom(follow.player.position);
	follow.elapsedTime += deltaSeconds;

	const focusDelta = follow.player.position.subtract(follow.focusPosition);
	const focusDistance = focusDelta.length();
	if (focusDistance > follow.config.focusMaxDistance && focusDistance > 0.0001) {
		follow.focusPosition = follow.player.position.subtract(
			focusDelta.scale(follow.config.focusMaxDistance / focusDistance),
		);
	}

	follow.focusPosition = Vector3.Lerp(
		follow.focusPosition,
		follow.player.position,
		Scalar.Clamp(deltaSeconds * follow.config.focusCatchUp, 0, 1),
	);

	const desiredPosition = follow.focusPosition.add(follow.offset);
	const desiredTarget = follow.focusPosition.add(follow.targetOffset);
	const positionLerpAmount = Scalar.Clamp(deltaSeconds * follow.config.positionSmoothing, 0, 1);
	const targetLerpAmount = Scalar.Clamp(deltaSeconds * follow.config.targetSmoothing, 0, 1);

	follow.camera.position = Vector3.Lerp(
		follow.camera.position,
		desiredPosition,
		positionLerpAmount,
	);

	applyCameraProjection(follow, engine);

	if (follow.camera.getTarget && follow.camera.setTarget) {
		follow.camera.setTarget(
			Vector3.Lerp(follow.camera.getTarget(), desiredTarget, targetLerpAmount),
		);
	}
}

export function applyCameraConfig(
	follow: CameraFollowState,
	config: CameraConfig = ISOMETRIC_CAMERA_CONFIG,
	snapToPosition = false,
) {
	follow.config = config;
	follow.offset = getCameraOffsetFromConfig(config);
	follow.targetOffset = new Vector3(0, config.targetYOffset, 0);

	if (snapToPosition) {
		follow.focusPosition.copyFrom(follow.player.position);
		follow.lookAhead.setAll(0);
		follow.camera.position.copyFrom(follow.focusPosition.add(follow.offset));

		if (follow.camera.setTarget) {
			follow.camera.setTarget(follow.focusPosition.add(follow.targetOffset));
		}
	}
}

export function getZoomedCameraConfig(config: CameraConfig, wheelDelta: number) {
	const zoomFactor = 1 + Math.sign(wheelDelta) * ZOOM_STEP;
	const orthographicSize = Scalar.Clamp(
		config.orthographicSize * zoomFactor,
		MIN_ORTHOGRAPHIC_SIZE,
		MAX_ORTHOGRAPHIC_SIZE,
	);

	return {
		...config,
		orthographicSize,
	};
}

function applyCameraProjection(follow: CameraFollowState, engine: Engine) {
	const aspectRatio = engine.getRenderWidth() / Math.max(engine.getRenderHeight(), 1);
	const orthoHalfHeight = follow.config.orthographicSize;
	const orthoHalfWidth = orthoHalfHeight * aspectRatio;

	follow.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
	follow.camera.orthoLeft = -orthoHalfWidth;
	follow.camera.orthoRight = orthoHalfWidth;
	follow.camera.orthoBottom = -orthoHalfHeight;
	follow.camera.orthoTop = orthoHalfHeight;
}

function getCameraOffsetFromConfig(config: CameraConfig) {
	const rotationRadians = degreesToRadians(config.rotationDegrees);
	const tiltRadians = degreesToRadians(config.tiltDegrees);
	const horizontalDistance = Math.cos(tiltRadians) * config.distance;
	const verticalDistance = Math.sin(tiltRadians) * config.distance;

	return new Vector3(
		-Math.sin(rotationRadians) * horizontalDistance,
		verticalDistance,
		-Math.cos(rotationRadians) * horizontalDistance,
	);
}

function degreesToRadians(degrees: number) {
	return degrees * (Math.PI / 180);
}
