"use client";

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
import "@babylonjs/core/Meshes/Builders/boxBuilder";

import { PortfolioModal } from "@/features/portfolio3d/components/PortfolioModal";
import { SceneOverlay } from "@/features/portfolio3d/components/SceneOverlay";
import { usePortfolioScene } from "@/features/portfolio3d/hooks/usePortfolioScene";

export default function Home() {
	const {
		canvasRef,
		closeModal,
		isModalOpen,
		selectedProject,
	} = usePortfolioScene();

	return (
		<main className="scene-shell">
			<canvas ref={canvasRef} className="scene-canvas" />
			<SceneOverlay isPromptVisible={false} />
			<PortfolioModal
				isOpen={isModalOpen}
				project={selectedProject}
				onClose={closeModal}
			/>
		</main>
	);
}
