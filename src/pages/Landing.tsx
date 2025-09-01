import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
	return (
		<div className="h-screen overflow-hidden flex flex-col relative bg-gradient-to-b from-[#0B1220] via-[#0A0F1A] to-[#0A0F1A] text-white">
			{/* Enhanced Background brain illustration layer */}
			<div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
				{/* Multiple gradient layers for depth */}
				<div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-tr from-teal-500/20 via-indigo-500/10 to-purple-500/20" />
				<div className="absolute inset-0 blur-2xl opacity-20 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-violet-500/15" />
				
				{/* Main neural network */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] md:w-[100vw] h-[120vh] md:h-[100vh]">
					<svg
						className="w-full h-full scale-110 md:scale-125"
						viewBox="0 0 600 450"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Enhanced neural brain illustration with data streams"
					>
						<defs>
							<linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#14b8a6" />
								<stop offset="100%" stopColor="#6366f1" />
							</linearGradient>
							<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor="#06b6d4" />
								<stop offset="100%" stopColor="#8b5cf6" />
							</linearGradient>
							<radialGradient id="pulse" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
								<stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
							</radialGradient>
							<radialGradient id="pulse2" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
								<stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
							</radialGradient>
						</defs>

						{/* Brain hemispheres with enhanced styling */}
						<g opacity="0.4">
							<path d="M100 230c0-90 80-150 160-150s150 60 150 150-80 150-160 150S100 320 100 230Z" stroke="url(#g1)" strokeWidth="2" />
							<path d="M350 230c0-90 80-150 160-150s150 60 150 150-80 150-160 150S350 320 350 230Z" stroke="url(#g2)" strokeWidth="2" />
						</g>
						
						{/* Neural connections with varied timing */}
						<g stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" opacity="0.6">
							<path d="M180 170 C220 140, 260 140, 300 170" className="animate-pulse" />
							<path d="M300 170 C340 200, 380 200, 420 170" className="animate-pulse" style={{ animationDelay: '200ms' }} />
							<path d="M200 230 C240 210, 260 260, 300 240" className="animate-pulse" style={{ animationDelay: '400ms' }} />
							<path d="M300 240 C340 220, 380 260, 420 230" className="animate-pulse" style={{ animationDelay: '600ms' }} />
							<path d="M220 290 C260 270, 280 300, 320 290" className="animate-pulse" style={{ animationDelay: '800ms' }} />
						</g>
						
						{/* Additional neural pathways */}
						<g stroke="url(#g2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
							<path d="M150 200 C180 180, 200 220, 230 200" className="animate-pulse" style={{ animationDelay: '300ms' }} />
							<path d="M370 200 C400 180, 420 220, 450 200" className="animate-pulse" style={{ animationDelay: '700ms' }} />
							<path d="M250 150 C280 130, 320 130, 350 150" className="animate-pulse" style={{ animationDelay: '500ms' }} />
						</g>
						
						{/* Neural nodes with enhanced pulsing */}
						{[
							{ x: 180, y: 170, color: "#a5b4fc" },
							{ x: 300, y: 170, color: "#a5b4fc" },
							{ x: 420, y: 170, color: "#a5b4fc" },
							{ x: 220, y: 290, color: "#c084fc" },
							{ x: 320, y: 290, color: "#c084fc" },
							{ x: 300, y: 240, color: "#a5b4fc" },
							{ x: 150, y: 200, color: "#67e8f9" },
							{ x: 450, y: 200, color: "#67e8f9" },
						].map((n, i) => (
							<g key={i}>
								<circle cx={n.x} cy={n.y} r="3" fill={n.color} />
								<circle cx={n.x} cy={n.y} r="18" fill="url(#pulse)" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: `${i * 120}ms` }} />
								<circle cx={n.x} cy={n.y} r="12" fill="url(#pulse2)" className="animate-ping" style={{ animationDuration: '3s', animationDelay: `${i * 150 + 500}ms` }} />
							</g>
						))}
						
						{/* Data flow indicators */}
						<g opacity="0.3">
							{[...Array(8)].map((_, i) => (
								<circle key={i} cx={50 + i * 70} cy={50} r="2" fill="#06b6d4" className="animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
							))}
							{[...Array(6)].map((_, i) => (
								<circle key={i} cx={80 + i * 80} cy={380} r="1.5" fill="#8b5cf6" className="animate-pulse" style={{ animationDelay: `${i * 250 + 100}ms` }} />
							))}
						</g>
					</svg>
				</div>
				
				{/* Floating particles for additional depth */}
				<div className="absolute inset-0">
					{[...Array(12)].map((_, i) => (
						<div
							key={i}
							className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 3}s`,
								animationDuration: `${2 + Math.random() * 2}s`
							}}
						/>
					))}
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
				{/* Main Hero Content */}
				<div className="relative z-10">
					<h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
						Conquer Procrastination.
					</h1>
					<p className="mt-6 max-w-3xl mx-auto text-gray-200 text-xl md:text-2xl">
						The neuroscience-based protocol to rewire your brain for action.
					</p>
					
					{/* User Testimonial */}
					<div className="mt-8 max-w-2xl mx-auto">
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
							<blockquote className="text-lg md:text-xl text-gray-100 italic">
								"Finally, a system that works with my brain!"
							</blockquote>
							<cite className="mt-3 block text-sm md:text-base text-teal-400 font-medium">
								— Sarah Chen, Developer
							</cite>
						</div>
					</div>
					
					{/* CTA Button */}
					<div className="mt-12 flex items-center justify-center">
						<Link
							to="/login"
							className="px-10 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-lg md:text-xl font-semibold shadow-xl shadow-teal-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/20"
							aria-label="Activate my Protocol"
						>
							Activate my Protocol
						</Link>
					</div>
				</div>

				{/* Enhanced Visual Elements - Focus Transformation Illustration */}
				<div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
					{/* Scattered to Focused Mind Visualization */}
					<div className="absolute top-1/4 left-1/4 w-32 h-32 opacity-20">
						<svg viewBox="0 0 100 100" className="w-full h-full">
							<g className="animate-pulse">
								<circle cx="20" cy="20" r="3" fill="#ef4444" opacity="0.6" />
								<circle cx="60" cy="30" r="2" fill="#f59e0b" opacity="0.5" />
								<circle cx="80" cy="70" r="4" fill="#ef4444" opacity="0.4" />
								<circle cx="30" cy="80" r="2" fill="#f59e0b" opacity="0.6" />
								<circle cx="70" cy="40" r="3" fill="#ef4444" opacity="0.5" />
							</g>
						</svg>
					</div>
					
					<div className="absolute top-1/3 right-1/4 w-24 h-24 opacity-25">
						<svg viewBox="0 0 100 100" className="w-full h-full">
							<g className="animate-pulse" style={{ animationDelay: '1s' }}>
								<circle cx="50" cy="50" r="8" fill="#14b8a6" opacity="0.7" />
								<circle cx="50" cy="50" r="15" fill="#14b8a6" opacity="0.3" />
								<circle cx="50" cy="50" r="25" fill="#14b8a6" opacity="0.1" />
							</g>
						</svg>
					</div>

					{/* Data Stream Animation */}
					<div className="absolute bottom-1/4 left-1/3 w-full h-1 opacity-30">
						<div className="h-full bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse"></div>
					</div>
					
					<div className="absolute bottom-1/3 right-1/3 w-full h-1 opacity-20">
						<div className="h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Landing;


