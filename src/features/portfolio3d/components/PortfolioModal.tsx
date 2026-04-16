"use client";

import { type ProjectConfig } from "@/data/projects";

type PortfolioModalProps = {
	isOpen: boolean;
	project: ProjectConfig;
	onClose: () => void;
};

export function PortfolioModal({ isOpen, project, onClose }: PortfolioModalProps) {
	return (
		<div
			id="portfolio-modal"
			className={`portfolio-modal ${isOpen ? "is-open" : ""}`}
			aria-hidden={!isOpen}
		>
			<div className="portfolio-modal__panel" role="dialog" aria-modal="false" aria-labelledby="portfolio-modal-title">
				<button
					type="button"
					className="portfolio-modal__close"
					onClick={onClose}
					aria-label="Fechar modal"
				>
					fechar
				</button>
				<p className="portfolio-modal__eyebrow">
					{project.status} | {project.year}
				</p>
				<h2 id="portfolio-modal-title" className="portfolio-modal__title">
					{project.title}
				</h2>
				<p className="portfolio-modal__body">
					{project.description}
				</p>
				{project.tags.length > 0 && (
					<div className="portfolio-modal__tags">
						{project.tags.map((tag) => (
							<span key={tag} className="portfolio-modal__tag">{tag}</span>
						))}
					</div>
				)}
				{project.images.length > 0 && (
					<div className="portfolio-modal__gallery">
						{project.images.map((image) => (
							<div key={image} className="portfolio-modal__image">{image}</div>
						))}
					</div>
				)}
				{project.link !== "#" && (
					<a
						className="portfolio-modal__link"
						href={project.link}
						target="_blank"
						rel="noreferrer"
					>
						{project.linkLabel}
					</a>
				)}
			</div>
		</div>
	);
}
