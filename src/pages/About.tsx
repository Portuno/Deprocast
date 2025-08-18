import React from 'react';
import { Brain, Heart, Rocket, Sparkles, Target, Link as LinkIcon } from 'lucide-react';

const About: React.FC = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0B1220] to-[#0A0F1A] text-white">
			<header className="container mx-auto px-6 py-10">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
						<Brain className="w-6 h-6 text-indigo-300" />
					</div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">About</h1>
				</div>
				<p className="mt-4 max-w-3xl text-gray-300">
					This space explains the protocol behind Deprocast, why I built it, and where we're headed next.
				</p>
			</header>

			<main className="container mx-auto px-6 pb-20">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* About Me */}
					<section
						className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl focus:outline-none"
						aria-label="About Me"
						tabIndex={0}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center">
								<Heart className="w-5 h-5 text-pink-300" />
							</div>
							<h2 className="text-xl font-semibold">About Me</h2>
						</div>
						<p className="mt-4 text-sm text-gray-300 leading-relaxed">
							I'm the creator of Deprocast. I built this after years of battling complex projects, dopamine crashes, and the
							"I'll start tomorrow" loop. Deprocast is my way of turning neuroscience into a daily system that actually gets
							things done—without shame or burnout.
						</p>
						<ul className="mt-4 space-y-2 text-sm text-gray-300">
							<li className="flex items-start gap-2"><Sparkles className="w-4 h-4 mt-0.5 text-pink-300" /> Grounded in practical neuroscience (ACC, PFC, DMN)</li>
							<li className="flex items-start gap-2"><Target className="w-4 h-4 mt-0.5 text-pink-300" /> Designed to create small wins and momentum every day</li>
							<li className="flex items-start gap-2"><LinkIcon className="w-4 h-4 mt-0.5 text-pink-300" /> Built to integrate with the tools you already use</li>
						</ul>
					</section>

					{/* About the Project */}
					<section
						className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl focus:outline-none"
						aria-label="About the Project"
						tabIndex={0}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
								<Rocket className="w-5 h-5 text-blue-300" />
							</div>
							<h2 className="text-xl font-semibold">About the Project</h2>
						</div>
						<p className="mt-4 text-sm text-gray-300 leading-relaxed">
							Deprocast turns overwhelming projects into dopamine-aligned micro-tasks. The protocol reduces threat perception, prevents
							analysis paralysis, and channels focus into simple, repeatable actions.
						</p>
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-200">
							<div className="rounded-lg border border-white/10 bg-white/5 p-3">
								<p className="font-medium">Core Principles</p>
								<ul className="mt-2 space-y-1 text-gray-300">
									<li>• One clear next step</li>
									<li>• Time-boxed execution</li>
									<li>• Immediate reward loop</li>
								</ul>
							</div>
							<div className="rounded-lg border border-white/10 bg-white/5 p-3">
								<p className="font-medium">What You Get</p>
								<ul className="mt-2 space-y-1 text-gray-300">
									<li>• Clarity on what to do next</li>
									<li>• Less friction to start</li>
									<li>• Consistent progress that compounds</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Roadmap */}
					<section
						className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl focus:outline-none"
						aria-label="Roadmap for future integrations"
						tabIndex={0}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-emerald-300" />
							</div>
							<h2 className="text-xl font-semibold">Roadmap for Future Integrations</h2>
						</div>
						<ul className="mt-4 space-y-3 text-sm text-gray-300">
							<li className="flex items-start gap-2">
								<span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs mt-0.5">Now</span>
								<span>Two-way Google Calendar sync for time-boxing and review</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs mt-0.5">Next</span>
								<span>Notion pages/tasks sync to auto-generate micro-tasks</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="px-2 py-0.5 rounded bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs mt-0.5">Next</span>
								<span>GitHub/Linear issues import with smart prioritization</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs mt-0.5">Later</span>
								<span>Slack and email nudges that reinforce the reward loop</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs mt-0.5">Later</span>
								<span>Mobile companion for on-the-go capture and quick wins</span>
							</li>
						</ul>
						<p className="mt-4 text-xs text-gray-400">
							Note: Roadmap is aspirational and may evolve based on user feedback.
						</p>
					</section>
				</div>
			</main>
		</div>
	);
};

export default About;


