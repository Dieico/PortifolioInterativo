import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";

// Base data for each interactive project in the scene.
// Edit these fields to control proximity, highlight color and modal content.
export type ProjectConfig = {
	// Exact mesh name used in the Babylon scene.
	meshName: string;
	// Maximum distance for interaction and project focus.
	interactionRadius: number;
	// Highlight color used when the mesh becomes active.
	activeColor: Color3;
	// Modal content.
	title: string;
	description: string;
	link: string;
	linkLabel: string;
	images: string[];
	tags: string[];
	status: string;
	year: string;
	// When the mesh does not exist yet, create a visual placeholder automatically.
	createExample?: boolean;
	exampleColor?: Color3;
	examplePosition?: Vector3;
};

// Fallback content used when an interactive mesh exists in the scene
// but was not registered with its own project data yet.
export const DEFAULT_MODAL_PROJECT: ProjectConfig = {
	meshName: "Project_Default",
	interactionRadius: 3,
	activeColor: Color3.White(),
	title: "Projeto",
	description: "Adicione este projeto em src/data/projects.ts para controlar conteudo, alcance e destaque visual.",
	link: "#",
	linkLabel: "Abrir projeto",
	images: [],
	tags: [],
	status: "Rascunho",
	year: "2026",
};

// Centralizes project content and calculates fallback positions
// inside the base mesh when it is available in the loaded scene.
export function getProjectConfigs(scene: Scene) {
	const baseRoot = scene.getNodeByName("Base.glb") ?? scene.getMeshByName("Base.glb") ?? scene.getMeshByName("Base");

	const fallbackPositions = [
		new Vector3(-18, 6, -18),
		new Vector3(18, 6, -8),
		new Vector3(-10, 6, 16),
	];

	let positions = fallbackPositions;

	if (baseRoot) {
		const bounds = baseRoot.getHierarchyBoundingVectors(true);
		const insetX = (bounds.max.x - bounds.min.x) * 0.22;
		const insetZ = (bounds.max.z - bounds.min.z) * 0.22;
		const y = bounds.max.y + 6;

		positions = [
			new Vector3(bounds.min.x + insetX, y, bounds.min.z + insetZ),
			new Vector3(bounds.max.x - insetX, y, bounds.min.z + insetZ),
			new Vector3(bounds.min.x + insetX, y, bounds.max.z - insetZ),
		];
	}

	return [
		{
			meshName: "Sertania.glb",
			interactionRadius: 100,
			activeColor: new Color3(1, 0.96, 0.96),
			title: "Portfolio 3D Interativo",
			description: "Projeto principal deste repositorio. Uma experiencia navegavel em perspectiva isometrica para apresentar identidade, stack e estudos visuais em um unico ambiente 3D.",
			link: "#",
			linkLabel: "Abrir projeto",
			images: [
				"Cena isometrica navegavel",
				"Modal contextual por proximidade",
				"Export estatico para GitHub Pages",
			],
			tags: ["Next.js", "Babylon.js", "TypeScript", "GitHub Pages"],
			status: "Projeto principal",
			year: "2026",
			createExample: true,
			exampleColor: new Color3(0.96, 0.43, 0.36),
			examplePosition: positions[0],
		},
		{
			meshName: "ColoHeros",
			interactionRadius: 100,
			activeColor: new Color3(0.89, 0.97, 1),
			title: "Espaco reservado para case 02",
			description: "Use este ponto da cena para cadastrar seu proximo case real. Troque o titulo, a descricao, as tags e o link quando o projeto estiver pronto para entrar no portfolio.",
			link: "#",
			linkLabel: "Abrir projeto",
			images: ["Substitua por imagens reais do case"],
			tags: ["Reservado", "Case futuro"],
			status: "Em preparo",
			year: "2026",
			createExample: true,
			exampleColor: new Color3(0.28, 0.67, 0.95),
			examplePosition: positions[1],
		},
		{
			meshName: "Comingsson",
			interactionRadius: 100,
			activeColor: new Color3(0.91, 1, 0.94),
			title: "Laboratorio de novos projetos",
			description: "Area pensada para estudos, prototipos ou experimentos interativos. E um bom lugar para mostrar processos, testes tecnicos ou trabalhos ainda em evolucao.",
			link: "#",
			linkLabel: "Abrir projeto",
			images: ["Espaco para prototipo ou experimento"],
			tags: ["Em breve", "Estudo", "Prototipo"],
			status: "Em breve",
			year: "2026",
			createExample: true,
			exampleColor: new Color3(0.34, 0.82, 0.56),
			examplePosition: positions[2],
		},
	] satisfies ProjectConfig[];
}
