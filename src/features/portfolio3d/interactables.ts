import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Tags } from "@babylonjs/core/Misc/tags";
import { Scene } from "@babylonjs/core/scene";

import { DEFAULT_MODAL_PROJECT, getProjectConfigs } from "@/data/projects";

import { type InteractableEntry } from "./types";

export function ensureConfiguredProjects(scene: Scene) {
	const projectConfigs = getProjectConfigs(scene);
	const configuredEntries: InteractableEntry[] = [];

	for (const config of projectConfigs) {
		let mesh = scene.getMeshByName(config.meshName);

		if (!mesh && config.createExample && config.examplePosition) {
			mesh = MeshBuilder.CreateBox(
				config.meshName,
				{ width: 8, height: 10, depth: 8 },
				scene,
			);
			mesh.position = config.examplePosition.clone();

			const material = new StandardMaterial(`${config.meshName}_Material`, scene);
			material.diffuseColor = config.exampleColor ?? new Color3(0.7, 0.7, 0.7);
			material.specularColor = new Color3(0.1, 0.1, 0.1);
			mesh.material = material;
		}

		if (!(mesh instanceof Mesh)) {
			continue;
		}

		Tags.AddTagsTo(mesh, "Interactable");
		configuredEntries.push({
			mesh,
			colliderMesh: findInteractableCollider(mesh),
			config,
		});
	}

	return configuredEntries;
}

export function getInteractableMeshes(scene: Scene, player: Mesh, configuredEntries: InteractableEntry[]) {
	const configuredMap = new Map(configuredEntries.map((entry) => [entry.mesh.name, entry]));

	return scene.meshes.flatMap((mesh) => {
		if (!(mesh instanceof Mesh) || mesh === player || mesh.name === "Player") {
			return [];
		}

		const configuredEntry = configuredMap.get(mesh.name);
		if (configuredEntry) {
			return [configuredEntry];
		}

		const hasTag = Tags.MatchesQuery(mesh, "Interactable");
		const hasProjectName = mesh.name.includes("Project_");

		if (!hasTag && !hasProjectName) {
			return [];
		}

		return [{
			mesh,
			colliderMesh: findInteractableCollider(mesh),
			config: {
				...DEFAULT_MODAL_PROJECT,
				meshName: mesh.name,
				title: formatProjectName(mesh.name),
				description: "Adicione este mesh ao getProjectConfigs para controlar area, cores e conteudo do modal.",
			},
		}];
	});
}

export function findClosestInteractable(player: Mesh, interactables: InteractableEntry[]) {
	let closestEntry: InteractableEntry | null = null;
	let closestDistance = Number.POSITIVE_INFINITY;

	for (const entry of interactables) {
		if (!entry.mesh.isEnabled() || !entry.mesh.isVisible) {
			continue;
		}

		const distance = Vector3.Distance(player.position, entry.mesh.getAbsolutePosition());
		if (distance < entry.config.interactionRadius && distance < closestDistance) {
			closestDistance = distance;
			closestEntry = entry;
		}
	}

	return closestEntry;
}

function formatProjectName(name: string) {
	return name.replace(/^Project_/i, "").replace(/[_-]+/g, " ").trim() || "Projeto";
}

function findInteractableCollider(mesh: Mesh) {
	for (const descendant of mesh.getDescendants(false, (node) => node instanceof Mesh)) {
		if (descendant instanceof Mesh && descendant.name === "Colisor") {
			descendant.isPickable = false;
			descendant.isVisible = false;
			descendant.visibility = 0;
			return descendant;
		}
	}

	return undefined;
}
