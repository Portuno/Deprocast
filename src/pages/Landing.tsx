import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
	return (
		<div className="h-screen overflow-hidden flex flex-col relative bg-gradient-to-b from-[#0B1220] via-[#0A0F1A] to-[#0A0F1A] text-white">
			{/* Background brain illustration layer */}
			<div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-tr from-teal-500/20 via-indigo-500/10 to-purple-500/20" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] md:w-[100vw] h-[120vh] md:h-[100vh]">
					<svg
						className="w-full h-full scale-110 md:scale-125"
						viewBox="0 0 600 450"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Stylized neural brain illustration"
					>
						<defs>
							<linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#14b8a6" />
								<stop offset="100%" stopColor="#6366f1" />
							</linearGradient>
							<radialGradient id="pulse" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
								<stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
							</radialGradient>
						</defs>

						<g opacity="0.35">
							<path d="M100 230c0-90 80-150 160-150s150 60 150 150-80 150-160 150S100 320 100 230Z" stroke="url(#g1)" strokeWidth="2" />
							<path d="M350 230c0-90 80-150 160-150s150 60 150 150-80 150-160 150S350 320 350 230Z" stroke="url(#g1)" strokeWidth="2" />
						</g>
						<g stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" opacity="0.55">
							<path d="M180 170 C220 140, 260 140, 300 170" className="animate-pulse" />
							<path d="M300 170 C340 200, 380 200, 420 170" className="animate-pulse" style={{ animationDelay: '200ms' }} />
							<path d="M200 230 C240 210, 260 260, 300 240" className="animate-pulse" style={{ animationDelay: '400ms' }} />
							<path d="M300 240 C340 220, 380 260, 420 230" className="animate-pulse" style={{ animationDelay: '600ms' }} />
							<path d="M220 290 C260 270, 280 300, 320 290" className="animate-pulse" style={{ animationDelay: '800ms' }} />
						</g>
						{[
							{ x: 180, y: 170 },
							{ x: 300, y: 170 },
							{ x: 420, y: 170 },
							{ x: 220, y: 290 },
							{ x: 320, y: 290 },
							{ x: 300, y: 240 },
						].map((n, i) => (
							<g key={i}>
								<circle cx={n.x} cy={n.y} r="3" fill="#a5b4fc" />
								<circle cx={n.x} cy={n.y} r="18" fill="url(#pulse)" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: `${i * 120}ms` }} />
							</g>
						))}
					</svg>
				</div>
			</div>
			<header className="container mx-auto px-8 md:px-12 py-8 md:py-10 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-2xl md:text-3xl font-semibold tracking-tight">Deprocast</span>
				</div>
				<nav className="hidden md:flex items-center gap-10 text-base md:text-lg text-gray-300">
					<Link to="/blog" className="hover:text-white">Blog</Link>
					<Link to="/pricing" className="hover:text-white">Pricing</Link>
					<Link to="/about" className="hover:text-white">About</Link>
					<Link
						to="/login"
						className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-teal-500/10"
						aria-label="Activate my Protocol"
					>
						Activate my Protocol
					</Link>
				</nav>
			</header>

			<main className="container mx-auto px-8 md:px-12 flex-1 text-center flex flex-col items-center justify-center overflow-hidden">
				<h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
					Conquer Procrastination.
				</h1>
				<p className="mt-6 max-w-3xl mx-auto text-gray-200 text-xl md:text-2xl">
					The neuroscience-based protocol to rewire your brain for action.
				</p>
				<div className="mt-12 flex items-center justify-center">
					<Link
						to="/login"
						className="px-10 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-lg md:text-xl font-semibold shadow-xl shadow-teal-500/10"
						aria-label="Activate my Protocol"
					>
						Activate my Protocol
					</Link>
				</div>
			</main>
		</div>
	);
};

export default Landing;


