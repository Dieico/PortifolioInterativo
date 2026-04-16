import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

import { findPlayerEditorMesh } from "./sceneMeshGroups";
import { type InputState } from "./types";

export const DEFAULT_PLAYER_SPEED = 140;
export const SHOW_BASE_PLAYER_VISUAL = true;
export const PLAYER_JUMP_HEIGHT = 150;
export const PLAYER_JUMP_VELOCITY = 500;

const PLAYER_HEIGHT = 24;
const PLAYER_WIDTH = 10;
const PLAYER_DEPTH = 10;
const PLAYER_ROTATION_SPEED = 10;
const PLAYER_GROUND_Y = PLAYER_HEIGHT / 2;
const PLAYER_EDITOR_VISUAL_SCALE = 10;
const PLAYER_EDITOR_VISUAL_Y_OFFSET = -10;

type PlayerMetadata = {
	targetYaw?: number;
	verticalVelocity?: number;
	isGrounded?: boolean;
	lastJumpPressed?: boolean;
	editorVisualAttached?: boolean;
};

export function createInputState(): InputState {
	return {
		w: false,
		a: false,
		s: false,
		d: false,
		space: false,
	};
}

export function ensurePlayer(scene: Scene) {
	const existingPlayer = scene.getMeshByName("Player");
	if (existingPlayer instanceof Mesh) {
		preparePlayer(existingPlayer);
		ensurePlayerFront(existingPlayer, scene);
		ensurePlayerMetadata(existingPlayer);
		attachEditorVisual(existingPlayer, scene);
		return existingPlayer;
	}

	const player = MeshBuilder.CreateBox(
		"Player",
		{
			width: PLAYER_WIDTH,
			height: PLAYER_HEIGHT,
			depth: PLAYER_DEPTH,
		},
		scene,
	);

	player.position = new Vector3(0, PLAYER_HEIGHT / 2, 0);
	player.rotationQuaternion = Quaternion.Identity();
	player.material = createMaterial(
		"Player_Body_Material",
		new Color3(0.94, 0.72, 0.44),
		scene,
	);

	preparePlayer(player);
	ensurePlayerFront(player, scene);
	ensurePlayerMetadata(player);
	attachEditorVisual(player, scene);
	return player;
}

export function updatePlayerMovement(
	player: Mesh,
	input: InputState,
	deltaSeconds: number,
	moveSpeed: number,
	movementBounds: ReturnType<typeof getMovementBounds>,
	obstacles: Mesh[] = [],
) {
	const metadata = ensurePlayerMetadata(player);
	const moveDirection = getMoveDirection(input);
	const jumpPressedThisFrame = input.space && !metadata.lastJumpPressed;

	if (jumpPressedThisFrame && metadata.isGrounded) {
		metadata.verticalVelocity = PLAYER_JUMP_HEIGHT;
		metadata.isGrounded = false;
	}

	if (moveDirection.lengthSquared() > 0) {
		moveDirection.normalize();
		metadata.targetYaw = Math.atan2(moveDirection.x, moveDirection.z);

		const movement = moveDirection.scale(moveSpeed * deltaSeconds);
		const nextPosition = resolvePlayerPosition(
			player,
			player.position,
			movement,
			movementBounds,
			obstacles,
		);
		nextPosition.y = player.position.y;
		player.position.copyFrom(nextPosition);
		rotatePlayerTowardsTarget(player, metadata.targetYaw, deltaSeconds);
	}

	updatePlayerVerticalMotion(player, metadata, deltaSeconds);
	metadata.lastJumpPressed = input.space;
}

export function getMovementBounds(scene: Scene, player: Mesh) {
	const baseRoot = scene.getNodeByName("Base.glb") ?? scene.getMeshByName("Base.glb") ?? scene.getMeshByName("Base");
	if (!baseRoot) {
		return null;
	}

	const baseMesh = baseRoot instanceof Mesh
		? baseRoot
		: baseRoot.getDescendants(false, (node) => node instanceof Mesh)[0];

	if (!(baseMesh instanceof Mesh)) {
		return null;
	}

	const playerHalfWidthX = (PLAYER_WIDTH * player.scaling.x) / 2;
	const playerHalfWidthZ = (PLAYER_DEPTH * player.scaling.z) / 2;
	const baseBounds = baseMesh.getHierarchyBoundingVectors(true);

	return {
		minX: baseBounds.min.x + playerHalfWidthX,
		maxX: baseBounds.max.x - playerHalfWidthX,
		minZ: baseBounds.min.z + playerHalfWidthZ,
		maxZ: baseBounds.max.z - playerHalfWidthZ,
	};
}

export function createMovementObstacles(meshes: Mesh[]) {
	return meshes.filter((mesh, index, allMeshes) => (
		mesh.isEnabled()
		&& allMeshes.findIndex((candidate) => candidate.uniqueId === mesh.uniqueId) === index
	));
}

function preparePlayer(player: Mesh) {
	if (!player.rotationQuaternion) {
		player.rotationQuaternion = Quaternion.FromEulerAngles(
			player.rotation.x,
			player.rotation.y,
			player.rotation.z,
		);
		player.rotation.setAll(0);
	}

	player.isPickable = false;
	player.checkCollisions = false;
	player.isVisible = SHOW_BASE_PLAYER_VISUAL;
	player.visibility = SHOW_BASE_PLAYER_VISUAL ? 0 : 0;
}

function ensurePlayerFront(player: Mesh, scene: Scene) {
	const frontMarkerName = `${player.name}_Front`;
	const existingMarker = scene.getMeshByName(frontMarkerName);
	if (existingMarker instanceof Mesh) {
		existingMarker.parent = player;
		return;
	}

	const frontMarker = MeshBuilder.CreateBox(
		frontMarkerName,
		{
			width: PLAYER_WIDTH * 0.5,
			height: PLAYER_HEIGHT * 0.2,
			depth: PLAYER_DEPTH * 0.18,
		},
		scene,
	);
	frontMarker.parent = player;
	frontMarker.position = new Vector3(0, PLAYER_HEIGHT * 0.12, PLAYER_DEPTH * 0.58);
	frontMarker.isVisible = SHOW_BASE_PLAYER_VISUAL;
	frontMarker.visibility = SHOW_BASE_PLAYER_VISUAL ? 1 : 0;
	frontMarker.material = createMaterial(
		`${frontMarkerName}_Material`,
		new Color3(0.16, 0.14, 0.12),
		scene,
	);

	const nose = MeshBuilder.CreateBox(
		`${player.name}_Nose`,
		{
			width: PLAYER_WIDTH * 0.18,
			height: PLAYER_HEIGHT * 0.12,
			depth: PLAYER_DEPTH * 0.22,
		},
		scene,
	);
	nose.parent = player;
	nose.position = new Vector3(0, 0, PLAYER_DEPTH * 0.7);
	nose.isVisible = SHOW_BASE_PLAYER_VISUAL;
	nose.visibility = SHOW_BASE_PLAYER_VISUAL ? 1 : 0;
	nose.material = createMaterial(
		`${player.name}_Nose_Material`,
		new Color3(0.92, 0.48, 0.42),
		scene,
	);
}

function ensurePlayerMetadata(player: Mesh) {
	const metadata = (player.metadata ?? {}) as PlayerMetadata;

	if (typeof metadata.targetYaw !== "number") {
		metadata.targetYaw = 0;
	}

	if (typeof metadata.verticalVelocity !== "number") {
		metadata.verticalVelocity = 0;
	}

	if (typeof metadata.isGrounded !== "boolean") {
		metadata.isGrounded = true;
	}

	if (typeof metadata.lastJumpPressed !== "boolean") {
		metadata.lastJumpPressed = false;
	}

	if (typeof metadata.editorVisualAttached !== "boolean") {
		metadata.editorVisualAttached = false;
	}

	player.metadata = metadata;
	return metadata;
}

function getMoveDirection(input: InputState) {
	const direction = new Vector3(0, 0, 0);

	if (input.w) {
		direction.addInPlace(new Vector3(1, 0, 1));
	}
	if (input.s) {
		direction.addInPlace(new Vector3(-1, 0, -1));
	}
	if (input.a) {
		direction.addInPlace(new Vector3(-1, 0, 1));
	}
	if (input.d) {
		direction.addInPlace(new Vector3(1, 0, -1));
	}

	return direction;
}

function rotatePlayerTowardsTarget(
	player: Mesh,
	targetYaw: number | undefined,
	deltaSeconds: number,
) {
	if (typeof targetYaw !== "number") {
		return;
	}

	const currentRotation = player.rotationQuaternion ?? Quaternion.Identity();
	const targetRotation = Quaternion.FromEulerAngles(0, targetYaw, 0);
	const rotationFactor = Scalar.Clamp(deltaSeconds * PLAYER_ROTATION_SPEED, 0, 1);

	player.rotationQuaternion = Quaternion.Slerp(
		currentRotation,
		targetRotation,
		rotationFactor,
	);
}

function updatePlayerVerticalMotion(
	player: Mesh,
	metadata: PlayerMetadata,
	deltaSeconds: number,
) {
	if (!metadata.isGrounded || (metadata.verticalVelocity ?? 0) > 0) {
		metadata.verticalVelocity = (metadata.verticalVelocity ?? 0) - (PLAYER_JUMP_VELOCITY * deltaSeconds);
		player.position.y += (metadata.verticalVelocity ?? 0) * deltaSeconds;
	}

	if (player.position.y <= PLAYER_GROUND_Y) {
		player.position.y = PLAYER_GROUND_Y;
		metadata.verticalVelocity = 0;
		metadata.isGrounded = true;
	}
}

function attachEditorVisual(player: Mesh, scene: Scene) {
	const metadata = ensurePlayerMetadata(player);
	if (metadata.editorVisualAttached) {
		return;
	}

	const visual = findPlayerEditorMesh(scene);
	if (!visual || visual === player) {
		return;
	}

	if (!visual.rotationQuaternion) {
		visual.rotationQuaternion = Quaternion.FromEulerAngles(
			visual.rotation.x,
			visual.rotation.y,
			visual.rotation.z,
		);
		visual.rotation.setAll(0);
	}

	visual.parent = player;
	visual.scaling.scaleInPlace(PLAYER_EDITOR_VISUAL_SCALE);
	visual.position = new Vector3(0, PLAYER_EDITOR_VISUAL_Y_OFFSET, 0);
	visual.isPickable = false;
	visual.checkCollisions = false;
	visual.isVisible = true;

	metadata.editorVisualAttached = true;
	player.metadata = metadata;
}

function clampPositionToBounds(
	position: Vector3,
	movementBounds: ReturnType<typeof getMovementBounds>,
) {
	if (!movementBounds) {
		return position;
	}

	return new Vector3(
		Scalar.Clamp(position.x, movementBounds.minX, movementBounds.maxX),
		position.y,
		Scalar.Clamp(position.z, movementBounds.minZ, movementBounds.maxZ),
	);
}

function resolvePlayerPosition(
	player: Mesh,
	currentPosition: Vector3,
	movement: Vector3,
	movementBounds: ReturnType<typeof getMovementBounds>,
	obstacles: Mesh[],
) {
	const intendedPosition = clampPositionToBounds(currentPosition.add(movement), movementBounds);

	if (!isBlockedByObstacle(player, intendedPosition, obstacles)) {
		return intendedPosition;
	}

	const axisCandidates = [
		clampPositionToBounds(
			new Vector3(currentPosition.x + movement.x, currentPosition.y, currentPosition.z),
			movementBounds,
		),
		clampPositionToBounds(
			new Vector3(currentPosition.x, currentPosition.y, currentPosition.z + movement.z),
			movementBounds,
		),
	];

	// Try the dominant axis first so the player keeps sliding along surfaces instead of feeling sticky.
	if (Math.abs(movement.z) > Math.abs(movement.x)) {
		axisCandidates.reverse();
	}

	for (const candidate of axisCandidates) {
		if (!isBlockedByObstacle(player, candidate, obstacles)) {
			return candidate;
		}
	}

	return currentPosition.clone();
}

function isBlockedByObstacle(player: Mesh, position: Vector3, obstacles: Mesh[]) {
	const originalPosition = player.position.clone();
	player.position.copyFrom(position);
	player.computeWorldMatrix(true);

	const isBlocked = obstacles.some((obstacle) => {
		if (!obstacle.isEnabled()) {
			return false;
		}

		obstacle.computeWorldMatrix(true);
		return player.intersectsMesh(obstacle, true);
	});

	player.position.copyFrom(originalPosition);
	player.computeWorldMatrix(true);
	return isBlocked;
}

function createMaterial(name: string, diffuseColor: Color3, scene: Scene) {
	const material = new StandardMaterial(name, scene);
	material.diffuseColor = diffuseColor;
	return material;
}
