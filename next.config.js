/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "Portifolio";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH
	?? (process.env.NODE_ENV === "production" ? `/${repoName}` : "");

const nextConfig = {
	reactStrictMode: false,
	output: "export",
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
	basePath,
	assetPrefix: basePath ? `${basePath}/` : undefined,
	env: {
		NEXT_PUBLIC_BASE_PATH: basePath,
	},

	turbopack: {
		rules: {
			"*.{fx}": {
				loaders: ["raw-loader"],
				as: "*.js",
			},
		},
	},
};

module.exports = nextConfig;
