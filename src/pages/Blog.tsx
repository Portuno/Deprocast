import React from 'react';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
	const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			(event.currentTarget as HTMLAnchorElement).click();
		}
	};

	return (
		<div className="h-screen overflow-hidden flex flex-col bg-gradient-to-b from-[#0B1220] via-[#0A0F1A] to-[#0A0F1A] text-white">
			<header className="container mx-auto px-6 py-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-lg font-semibold tracking-tight">Deprocast</span>
				</div>
				<nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
					<Link to="/blog" className="hover:text-white" tabIndex={0} aria-label="Ir al Blog" onKeyDown={handleKeyDown}>Blog</Link>
					<Link to="/pricing" className="hover:text-white" tabIndex={0} aria-label="Ver Pricing" onKeyDown={handleKeyDown}>Pricing</Link>
					<Link to="/about" className="hover:text-white" tabIndex={0} aria-label="Sobre nosotros" onKeyDown={handleKeyDown}>About</Link>
					<Link
						to="/login"
						className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-teal-500/10"
						tabIndex={0}
						aria-label="Activate my Protocol"
						onKeyDown={handleKeyDown}
					>
						Activate my Protocol
					</Link>
				</nav>
			</header>

			<main className="container mx-auto px-6 flex-1 flex items-center justify-center text-center">
				<div className="max-w-3xl">
					<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Blog</h1>
					<p className="mt-4 text-gray-300 md:text-lg">Insights on neuroscience, behavior design, and AI coaching. Content coming soon.</p>
					<div className="mt-8 inline-flex gap-3">
						<Link
							to="/login"
							className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-teal-500/10"
							tabIndex={0}
							aria-label="Activate my Protocol"
							onKeyDown={handleKeyDown}
						>
							Activate my Protocol
						</Link>
						<Link
							to="/pricing"
							className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-white/90 hover:text-white"
							tabIndex={0}
							aria-label="Ver planes"
							onKeyDown={handleKeyDown}
						>
							See Pricing
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Blog;


