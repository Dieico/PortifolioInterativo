"use client";

type SceneOverlayProps = {
	isPromptVisible: boolean;
};

export function SceneOverlay({ isPromptVisible }: SceneOverlayProps) {
	return (
		<>
			<header className="scene-title" aria-label="Titulo do portfolio">
				<p className="scene-title__eyebrow">Portfolio</p>
				<h1 className="scene-title__heading">Dieico</h1>
			</header>
			<div
				id="interact-prompt"
				className={`interact-prompt ${isPromptVisible ? "is-visible" : ""}`}
			>
				Prima [E] para interagir
			</div>
			<aside className="controls-legend" aria-label="Controles da cena">
				<p className="controls-legend__title">Controles</p>
				<ul className="controls-legend__list">
					<li><span>W A S D</span> mover</li>
					<li><span>Espaco</span> pular</li>
					<li><span>Mouse wheel</span> zoom</li>
				</ul>
			</aside>
		</>
	);
}
