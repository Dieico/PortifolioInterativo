import { PhysicsAggregate, type PhysicsAggregateParameters } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsMotionType, PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";

type MeshPhysicsDefinition = {
	shapeType: PhysicsShapeType;
	motionType: PhysicsMotionType;
	options: PhysicsAggregateParameters;
	linearDamping?: number;
	angularDamping?: number;
	gravityFactor?: number;
};

type MeshGroupDefinition = {
	meshNames: string[];
	checkCollisions: boolean;
	isPickable: boolean;
	isVisible?: boolean;
	physics?: MeshPhysicsDefinition | null;
};

type MeshMetadata = {
	scenePhysicsAggregate?: PhysicsAggregate;
};

const DEFAULT_STATIC_PHYSICS: MeshPhysicsDefinition = {
	shapeType: PhysicsShapeType.MESH,
	motionType: PhysicsMotionType.STATIC,
	options: {
		mass: 0,
		friction: 0.8,
		restitution: 0,
	},
};

const DEFAULT_DYNAMIC_PHYSICS: MeshPhysicsDefinition = {
	shapeType: PhysicsShapeType.BOX,
	motionType: PhysicsMotionType.DYNAMIC,
	options: {
		mass: 1,
		friction: 0.4,
		restitution: 0.1,
	},
	linearDamping: 0.2,
	angularDamping: 0.4,
	gravityFactor: 1,
};

export const STATIC_SCENE_MESHES = [
	"Base.glb",
	"Base",
	"Cube",	
	"Cube Collider",
];

export const PLAYER_EDITOR_MESHES = [
	"Personagem.glb"	
];

export const DYNAMIC_SCENE_MESHES = [
];

export const SCENE_MESH_GROUPS: Record<string, MeshGroupDefinition> = {
	staticEnvironment: {
		meshNames: STATIC_SCENE_MESHES,
		checkCollisions: true,
		isPickable: false,
		physics: DEFAULT_STATIC_PHYSICS,
	},
	playerCharacterSource: {
		meshNames: PLAYER_EDITOR_MESHES,
		checkCollisions: false,
		isPickable: false,
		physics: null,
	},
	dynamicProps: {
		meshNames: DYNAMIC_SCENE_MESHES,
		checkCollisions: true,
		isPickable: true,
		physics: DEFAULT_DYNAMIC_PHYSICS,
	},
};

export function applySceneMeshGroups(scene: Scene) {
	for (const group of Object.values(SCENE_MESH_GROUPS)) {
		const meshes = resolveMeshes(scene, group.meshNames);

		for (const mesh of meshes) {
			mesh.checkCollisions = group.checkCollisions;
			mesh.isPickable = group.isPickable;

			if (typeof group.isVisible === "boolean") {
				mesh.isVisible = group.isVisible;
			}

			applyMeshPhysics(mesh, group.physics);
		}
	}
}

export function findPlayerEditorMesh(scene: Scene) {
	for (const name of PLAYER_EDITOR_MESHES) {
		const directMesh = scene.getMeshByName(name);
		if (directMesh instanceof Mesh && hasValidGeometry(directMesh)) {
			return directMesh;
		}

		const node = scene.getNodeByName(name);
		if (!node) {
			continue;
		}

		for (const descendant of node.getDescendants(false, (candidate) => candidate instanceof Mesh)) {
			if (descendant instanceof Mesh && hasValidGeometry(descendant)) {
				return descendant;
			}
		}
	}

	return null;
}

function applyMeshPhysics(mesh: Mesh, physics: MeshPhysicsDefinition | null | undefined) {
	if (!physics) {
		disposeMeshPhysics(mesh);
		return;
	}

	if (requiresGeometry(physics.shapeType) && !hasValidGeometry(mesh)) {
		disposeMeshPhysics(mesh);
		return;
	}

	const aggregate = ensureMeshPhysics(mesh, physics);
	aggregate.body.setMotionType(physics.motionType);

	if (typeof physics.linearDamping === "number") {
		aggregate.body.setLinearDamping(physics.linearDamping);
	}

	if (typeof physics.angularDamping === "number") {
		aggregate.body.setAngularDamping(physics.angularDamping);
	}

	if (typeof physics.gravityFactor === "number") {
		aggregate.body.setGravityFactor(physics.gravityFactor);
	}
}

function ensureMeshPhysics(mesh: Mesh, physics: MeshPhysicsDefinition) {
	const metadata = getMeshMetadata(mesh);
	const existingAggregate = metadata.scenePhysicsAggregate;
	if (existingAggregate && !existingAggregate.body.isDisposed) {
		return existingAggregate;
	}

	if (mesh.physicsBody && !mesh.physicsBody.isDisposed) {
		mesh.physicsBody.dispose();
		mesh.physicsBody = null;
	}

	const aggregate = new PhysicsAggregate(
		mesh,
		physics.shapeType,
		physics.options,
		mesh.getScene(),
	);
	aggregate.body.setMotionType(physics.motionType);
	metadata.scenePhysicsAggregate = aggregate;
	mesh.metadata = metadata;
	return aggregate;
}

function disposeMeshPhysics(mesh: Mesh) {
	const metadata = getMeshMetadata(mesh);

	if (metadata.scenePhysicsAggregate) {
		metadata.scenePhysicsAggregate.dispose();
		delete metadata.scenePhysicsAggregate;
	}

	if (mesh.physicsBody && !mesh.physicsBody.isDisposed) {
		mesh.physicsBody.dispose();
		mesh.physicsBody = null;
	}

	mesh.metadata = metadata;
}

function getMeshMetadata(mesh: Mesh) {
	return (mesh.metadata ?? {}) as MeshMetadata;
}

function requiresGeometry(shapeType: PhysicsShapeType) {
	return shapeType === PhysicsShapeType.MESH || shapeType === PhysicsShapeType.CONVEX_HULL;
}

function hasValidGeometry(mesh: Mesh) {
	const positions = mesh.getVerticesData("position");
	return Array.isArray(positions) ? positions.length > 0 : Boolean(positions && positions.length > 0);
}

function resolveMeshes(scene: Scene, meshNames: string[]) {
	const meshes = new Map<string, Mesh>();

	for (const name of meshNames) {
		const directMesh = scene.getMeshByName(name);
		if (directMesh instanceof Mesh) {
			meshes.set(directMesh.uniqueId.toString(), directMesh);
		}

		const node = scene.getNodeByName(name);
		if (!node) {
			continue;
		}

		for (const descendant of node.getDescendants(false, (candidate) => candidate instanceof Mesh)) {
			if (descendant instanceof Mesh) {
				meshes.set(descendant.uniqueId.toString(), descendant);
			}
		}
	}

	return Array.from(meshes.values());
}
