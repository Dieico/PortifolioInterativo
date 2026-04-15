"use client";

import { useEffect, useRef } from "react";

import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneLoaderFlags } from "@babylonjs/core/Loading/sceneLoaderFlags";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

import HavokPhysics from "@babylonjs/havok";

import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";

import "@babylonjs/core/Cameras/universalCamera";

import "@babylonjs/core/Meshes/groundMesh";

import "@babylonjs/core/Lights/directionalLight";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/XR/features/WebXRDepthSensing";

import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/Rendering/prePassRendererSceneComponent";

import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

import "@babylonjs/core/Physics";

import "@babylonjs/materials/sky";

import { loadScene } from "babylonjs-editor-tools";

/**
 * We import the map of all scripts attached to objects in the editor.
 * This will allow the loader from `babylonjs-editor-tools` to attach the scripts to the
 * loaded objects (scene, meshes, transform nodes, lights, cameras, etc.).
 */
import { scriptsMap } from "@/scripts";

export default function Home() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

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

		handleLoad(engine, scene);

		let listener: () => void;
		window.addEventListener("resize", listener = () => {
			engine.resize();
		});

		return () => {
			scene.dispose();
			engine.dispose();

			window.removeEventListener("resize", listener);
		};
	}, [canvasRef]);

	async function handleLoad(engine: Engine, scene: Scene) {
		const havok = await HavokPhysics();
		scene.enablePhysics(new Vector3(0, -981, 0), new HavokPlugin(true, havok));

		SceneLoaderFlags.ForceFullSceneLoadingForIncremental = true;
		await loadScene("/scene/", "example.babylon", scene, scriptsMap, {
			quality: "high",
		});

		// Fallback: se os scripts não estiverem presentes na cena, criamos um player e uma câmera isométrica simples
		if (!scene.getMeshByName("player")) {
			const { MeshBuilder } = await import("@babylonjs/core/Meshes/meshBuilder");
			const player = MeshBuilder.CreateCylinder("player", { height: 1.6, diameter: 0.6 }, scene);
			player.position = player.position.clone();
			player.position.y = 0.8;
			player.checkCollisions = true;

			// input handling
			const keys: Record<string, boolean> = {};
			const onKeyDown = (e: KeyboardEvent) => (keys[e.key.toLowerCase()] = true);
			const onKeyUp = (e: KeyboardEvent) => (keys[e.key.toLowerCase()] = false);

			window.addEventListener("keydown", onKeyDown);
			window.addEventListener("keyup", onKeyUp);

			// movement update
			scene.onBeforeRenderObservable.add(() => {
				const delta = scene.getEngine().getDeltaTime() / 1000;
				const dir = new Vector3(0, 0, 0);
				if (keys["w"]) dir.z -= 1;
				if (keys["s"]) dir.z += 1;
				if (keys["a"]) dir.x -= 1;
				if (keys["d"]) dir.x += 1;

				if (dir.lengthSquared() > 0) {
					dir.normalize();
					const speed = 5;
					const move = dir.scale(speed * delta);
					try { (player as any).moveWithCollisions(move); } catch (e) { player.position.addInPlace(move); }
				}
			});

			// cleanup on scene dispose
			scene.onDisposeObservable.add(() => {
				window.removeEventListener("keydown", onKeyDown);
				window.removeEventListener("keyup", onKeyUp);
			});

			// create iso camera if missing
			if (!scene.getCameraByName("isoCamera")) {
				const { UniversalCamera } = await import("@babylonjs/core/Cameras/universalCamera");
				const cam = new UniversalCamera("isoCamera", new Vector3(player.position.x - 12 * Math.cos(Math.PI / 4), player.position.y + 12 * 0.6, player.position.z - 12 * Math.sin(Math.PI / 4)), scene);
				cam.rotation = new Vector3(-Math.PI / 6, Math.PI / 4, 0);
				cam.fov = 0.8;
				cam.minZ = 0.1;
				try { cam.inputs.clear(); } catch (e) {}

				const smoothing = 0.08;
				scene.onBeforeRenderObservable.add(() => {
					const desired = new Vector3(
						player.position.x - 12 * Math.cos(Math.PI / 4),
						player.position.y + 12 * 0.6,
						player.position.z - 12 * Math.sin(Math.PI / 4)
					);
					cam.position = Vector3.Lerp(cam.position, desired, smoothing);
					cam.setTarget(player.position);
				});
				scene.activeCamera = cam;
			}
		}

		// Prefer the isometric camera if our script created it in the scene
		const isoCam = scene.getCameraByName("isoCamera");
		if (isoCam) {
			scene.activeCamera = isoCam;
		}

		if (scene.activeCamera) {
			scene.activeCamera.attachControl();
		}

		engine.runRenderLoop(() => {
			scene.render();
		});
	}

	return (
		<main className="flex w-screen h-screen flex-col items-center justify-between">
			<canvas
				ref={canvasRef}
				className="w-full h-full outline-none select-none"
			/>
		</main>
	);
}
