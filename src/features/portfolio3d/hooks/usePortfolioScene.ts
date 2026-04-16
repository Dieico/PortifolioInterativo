"use client";

import { useEffect, useRef, useState } from "react";

import { Engine } from "@babylonjs/core/Engines/engine";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { SceneLoaderFlags } from "@babylonjs/core/Loading/sceneLoaderFlags";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Scene } from "@babylonjs/core/scene";
import HavokPhysics from "@babylonjs/havok";
import { loadScene } from "babylonjs-editor-tools";

import { DEFAULT_MODAL_PROJECT, type ProjectConfig } from "@/data/projects";
import { scriptsMap } from "@/scripts";

import {
	ISOMETRIC_CAMERA_CONFIG,
	applyCameraConfig,
	createCameraFollowState,
	getZoomedCameraConfig,
	updateCameraFollow,
} from "../camera";
import {
	ensureConfiguredProjects,
	findClosestInteractable,
	getInteractableMeshes,
} from "../interactables";
import { applySceneMeshGroups } from "../sceneMeshGroups";
import {
	createMovementObstacles,
	createInputState,
	DEFAULT_PLAYER_SPEED,
	ensurePlayer,
	getMovementBounds,
	updatePlayerMovement,
} from "../player";
import { type CameraConfig, type CameraFollowState, type InteractableEntry } from "../types";

export function usePortfolioScene() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const activeInteractableRef = useRef<InteractableEntry | null>(null);
	const movementEnabledRef = useRef(true);
	const cameraConfigRef = useRef<CameraConfig>({ ...ISOMETRIC_CAMERA_CONFIG });
	const cameraFollowRef = useRef<CameraFollowState | null>(null);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<ProjectConfig>(DEFAULT_MODAL_PROJECT);

	const closeModal = () => {
		setIsModalOpen(false);
	};

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const sceneRootPath = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/scene/`;

		const engine = new Engine(canvasRef.current, true, {
			stencil: true,
			antialias: true,
			audioEngine: true,
			adaptToDeviceRatio: true,
			disableWebGL2Support: false,
			useHighPrecisionFloats: true,
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: false,
		});

		const scene = new Scene(engine);

		const handleLoad = async () => {
			const havok = await HavokPhysics();
			scene.enablePhysics(new Vector3(0, -981, 0), new HavokPlugin(true, havok));

			SceneLoaderFlags.ForceFullSceneLoadingForIncremental = true;
			await loadScene(sceneRootPath, "example.babylon", scene, scriptsMap, {
				quality: "high",
			});
			applySceneMeshGroups(scene);

			const highlight = new HighlightLayer("interactable-highlight", scene);
			const player = ensurePlayer(scene);
			const configuredProjects = ensureConfiguredProjects(scene);
			const movementBounds = getMovementBounds(scene, player);
			const input = createInputState();
			const interactables = getInteractableMeshes(scene, player, configuredProjects);
			const movementObstacles = createMovementObstacles(
				interactables.map((entry) => entry.colliderMesh ?? entry.mesh),
			);
			const cameraFollow = scene.activeCamera
				? createCameraFollowState(scene.activeCamera, player, cameraConfigRef.current)
				: null;
			cameraFollowRef.current = cameraFollow;

			movementEnabledRef.current = true;
			activeInteractableRef.current = null;
			setIsModalOpen(false);

			const updateFocus = (entry: InteractableEntry | null) => {
				if (activeInteractableRef.current?.mesh === entry?.mesh) {
					return;
				}

				if (activeInteractableRef.current) {
					highlight.removeMesh(activeInteractableRef.current.mesh);
				}

				activeInteractableRef.current = entry;

				if (entry) {
					highlight.addMesh(entry.mesh, entry.config.activeColor);
				}
			};

			(window as Window & { closePortfolioModal?: () => void }).closePortfolioModal = closeModal;

			const keyDownListener = (event: KeyboardEvent) => {
				const key = event.code === "Space" ? "space" : event.key.toLowerCase();
				if (key in input) {
					input[key as keyof typeof input] = true;
				}
			};

			const keyUpListener = (event: KeyboardEvent) => {
				const key = event.code === "Space" ? "space" : event.key.toLowerCase();
				if (key in input) {
					input[key as keyof typeof input] = false;
				}
			};

			window.addEventListener("keydown", keyDownListener);
			window.addEventListener("keyup", keyUpListener);

			const wheelListener = (event: WheelEvent) => {
				if (!cameraFollowRef.current) {
					return;
				}

				event.preventDefault();
				const nextConfig = getZoomedCameraConfig(cameraConfigRef.current, event.deltaY);
				cameraConfigRef.current = nextConfig;
				applyCameraConfig(cameraFollowRef.current, nextConfig, false);
			};

			canvasRef.current?.addEventListener("wheel", wheelListener, { passive: false });

			scene.onBeforeRenderObservable.add(() => {
				const deltaSeconds = engine.getDeltaTime() / 1000;

				if (movementEnabledRef.current) {
					updatePlayerMovement(
						player,
						input,
						deltaSeconds,
						DEFAULT_PLAYER_SPEED,
						movementBounds,
						movementObstacles,
					);
				}

				if (cameraFollow) {
					updateCameraFollow(cameraFollow, engine, deltaSeconds);
				}

				const closestInteractable = findClosestInteractable(player, interactables);
				updateFocus(closestInteractable);

				if (closestInteractable) {
					setSelectedProject((current) => (
						current.meshName === closestInteractable.config.meshName
							? current
							: closestInteractable.config
					));
					setIsModalOpen(true);
				} else {
					setIsModalOpen(false);
				}
			});

			scene.onDisposeObservable.add(() => {
				window.removeEventListener("keydown", keyDownListener);
				window.removeEventListener("keyup", keyUpListener);
				canvasRef.current?.removeEventListener("wheel", wheelListener);
				delete (window as Window & { closePortfolioModal?: () => void }).closePortfolioModal;
				highlight.dispose();
				cameraFollowRef.current = null;
			});

			engine.runRenderLoop(() => {
				scene.render();
			});
		};

		void handleLoad();

		const resizeListener = () => {
			engine.resize();
		};

		window.addEventListener("resize", resizeListener);

		return () => {
			scene.dispose();
			engine.dispose();
			window.removeEventListener("resize", resizeListener);
		};
	}, []);

	return {
		canvasRef,
		closeModal,
		isModalOpen,
		selectedProject,
	};
}
