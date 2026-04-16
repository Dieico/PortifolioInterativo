import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Portfolio 3D Interativo",
	description: "Portfolio pessoal em Next.js e Babylon.js com navegacao isometrica e cena 3D interativa.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<body className={`${inter.className} antialiased`}>{children}</body>
		</html>
	);
}
