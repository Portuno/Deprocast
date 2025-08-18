import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
	const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			(event.currentTarget as HTMLElement).click();
		}
	};

	return (
		<div className="h-screen w-full overflow-hidden bg-gradient-to-b from-[#0B1220] via-[#0A0F1A] to-[#0A0F1A] text-white flex flex-col">
			{/* Top bar */}
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

			{/* Single-screen content: unified module with benefits and pricing */}
			<main className="container mx-auto px-6 flex-1 flex items-center justify-center">
				<div className="relative w-full max-w-6xl">
					<div className="absolute inset-0 -z-10 blur-2xl opacity-40 bg-gradient-to-r from-teal-500/20 via-indigo-500/10 to-purple-500/20"></div>
					<div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
						{/* Connecting glow */}
						<div className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-teal-400/40 via-indigo-400/40 to-purple-400/40"></div>
						{/* Particles */}
						<div className="pointer-events-none absolute inset-0">
							<span className="absolute top-10 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-teal-300/70 animate-ping"></span>
							<span className="absolute bottom-10 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-300/70 animate-ping" style={{ animationDelay: '300ms' }}></span>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2">
							{/* Left: Subtle TENET benefits */}
							<section className="p-6 md:p-8">
								<h2 className="text-2xl md:text-3xl font-bold">TENET Protocol</h2>
								<ul className="mt-6 space-y-5">
									<li>
										<h3 className="text-lg font-semibold">
											<span className="text-teal-300 font-extrabold">T</span>ransformation Protocol
										</h3>
										<p className="text-gray-300">A complete neuroscience-based brain rewiring system that adapts to your unique patterns.</p>
									</li>
									<li>
										<h3 className="text-lg font-semibold">
											<span className="text-indigo-300 font-extrabold">E</span>xpert AI Neural Analysis
										</h3>
										<p className="text-gray-300">Get personalized guidance and real-time insights based on your unique brain patterns and data.</p>
									</li>
									<li>
										<h3 className="text-lg font-semibold">
											<span className="text-purple-300 font-extrabold">N</span>euro-Scientific Task Breakdown
										</h3>
										<p className="text-gray-300">Our scientifically designed task decomposition works with your brain to maximize motivation and focus.</p>
									</li>
									<li>
										<h3 className="text-lg font-semibold">
											<span className="text-pink-300 font-extrabold">E</span>nhanced Progress Tracking
										</h3>
										<p className="text-gray-300">Real-time neural transformation monitoring with advanced analytics and actionable insights into your performance.</p>
									</li>
									<li>
										<h3 className="text-lg font-semibold">
											<span className="text-amber-300 font-extrabold">T</span>ools for Permanent Change
										</h3>
										<p className="text-gray-300">Gain priority access to cutting-edge neuroscience breakthroughs and advanced features designed to consolidate your new habits.</p>
									</li>
								</ul>
							</section>

							{/* Right: Pricing + CTA */}
							<aside className="p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col items-center justify-center text-center">
								<div>
									<p className="text-sm uppercase tracking-widest text-gray-400">Membership</p>
									<div className="mt-2 text-4xl md:text-5xl font-extrabold">
										€39.99 <span className="text-base md:text-lg font-medium text-gray-300">/ month</span>
									</div>
									<p className="mt-2 text-sm text-gray-400">Cancel anytime</p>
								</div>
								<Link
									to="/login"
									className="mt-6 inline-flex items-center justify-center w-full md:w-auto px-7 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-semibold shadow-lg shadow-rose-500/20"
									tabIndex={0}
									aria-label="Activate Your Neural Transformation"
									onKeyDown={handleKeyDown}
								>
									Activate Your Neural Transformation
								</Link>
								<p className="mt-3 text-xs text-gray-400">Secure checkout. No commitment. Instant access.</p>
							</aside>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Pricing;


