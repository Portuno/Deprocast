import React, { useEffect, useMemo, useState } from 'react';
import { Plus, FolderOpen, Pencil, Trash2, X } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import { createProject, listProjects, updateProject, deleteProject, type DbProject } from '../integrations/supabase/projects';

type ProjectCategory = 'Professional' | 'Personal' | 'Learning' | 'Other';

type NewProjectFormData = {
	title: string;
	description: string;
	targetCompletionDate: string;
	category?: ProjectCategory;
	motivation?: string;
	perceivedDifficulty?: number; // 1-10
	knownObstacles?: string;
	skillsResourcesNeeded: string[];
};

const initialFormState: NewProjectFormData = {
	title: '',
	description: '',
	targetCompletionDate: '',
	category: undefined,
	motivation: '',
	perceivedDifficulty: 5,
	knownObstacles: '',
	skillsResourcesNeeded: []
};

const Projects: React.FC = () => {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [formData, setFormData] = useState<NewProjectFormData>(initialFormState);
	const [skillsInput, setSkillsInput] = useState('');
	const [projects, setProjects] = useState<DbProject[]>([]);
	const [loading, setLoading] = useState(false);
	const [openProjectId, setOpenProjectId] = useState<string | null>(null);
	const isSubmitDisabled = useMemo(() => {
		return (
			formData.title.trim().length === 0 ||
			formData.description.trim().length === 0 ||
			formData.targetCompletionDate.trim().length === 0
		);
	}, [formData]);

	const handleOpenForm = () => {
		setShowCreateForm(true);
	};

	const handleCancel = () => {
		setShowCreateForm(false);
		setFormData(initialFormState);
		setSkillsInput('');
	};

	const handleChange = (field: keyof NewProjectFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const value = field === 'perceivedDifficulty' ? Number(event.target.value) : event.target.value;
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleAddSkillsFromInput = () => {
		if (!skillsInput.trim()) return;
		const parsed = skillsInput
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		if (parsed.length === 0) return;
		setFormData((prev) => ({ ...prev, skillsResourcesNeeded: Array.from(new Set([...prev.skillsResourcesNeeded, ...parsed])) }));
		setSkillsInput('');
	};

	const handleRemoveSkill = (skill: string) => {
		setFormData((prev) => ({ ...prev, skillsResourcesNeeded: prev.skillsResourcesNeeded.filter((s) => s !== skill) }));
	};

	const handleSkillsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleAddSkillsFromInput();
		}
	};

	const refreshProjects = async () => {
		const data = await listProjects();
		setProjects(data);
	};

	useEffect(() => {
		refreshProjects().catch(() => {});
		const handler = () => refreshProjects().catch(() => {});
		window.addEventListener('storage', handler);
		return () => window.removeEventListener('storage', handler);
	}, []);

	const handleSubmit = async () => {
		if (isSubmitDisabled) return;
		setLoading(true);
		try {
			await createProject({
				title: formData.title.trim(),
				description: formData.description.trim(),
				target_completion_date: formData.targetCompletionDate,
				category: formData.category ?? null,
				motivation: formData.motivation || null,
				perceived_difficulty: formData.perceivedDifficulty ?? null,
				known_obstacles: formData.knownObstacles || null,
				skills_resources_needed: formData.skillsResourcesNeeded,
			});
			await refreshProjects();
			handleCancel();
		} finally {
			setLoading(false);
		}
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
			<div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
						<p className="text-gray-400">Create a new project to kickstart your personalized AI breakdown</p>
          </div>
          <button
						onClick={handleOpenForm}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
						aria-label="Create a new project"
						role="button"
						tabIndex={0}
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
						<div className="space-y-6">
							{/* Essential Information */}
            <div className="space-y-4">
								<h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Essential Information</h4>
              <div>
									<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="title">Project Title</label>
                <input
										id="title"
                  type="text"
										value={formData.title}
										onChange={handleChange('title')}
										placeholder="e.g., Web Development, Marketing Campaign"
										aria-label="Project Title"
										className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="description">Project Goal / Description</label>
									<textarea
										id="description"
										value={formData.description}
										onChange={handleChange('description')}
										placeholder="Describe what you want to achieve in as much detail as possible..."
										aria-label="Project Goal or Description"
										rows={5}
										className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="target-date">Target Completion Date</label>
									<input
										id="target-date"
										type="date"
										value={formData.targetCompletionDate}
										onChange={handleChange('targetCompletionDate')}
										aria-label="Target Completion Date"
										className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
									/>
								</div>
							</div>

							{/* Optional Information */}
							<div className="space-y-4">
								<h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Optional (Recommended)</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="category">Project Type / Category</label>
										<select
											id="category"
											value={formData.category || ''}
											onChange={handleChange('category')}
											aria-label="Project Type or Category"
											className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
										>
											<option value="">Select a category</option>
											<option value="Professional">Professional</option>
											<option value="Personal">Personal</option>
											<option value="Learning">Learning</option>
											<option value="Other">Other</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="perceived-difficulty">Perceived Difficulty (1-10)</label>
										<input
											id="perceived-difficulty"
											type="number"
											min={1}
											max={10}
											value={formData.perceivedDifficulty ?? 5}
											onChange={handleChange('perceivedDifficulty')}
											aria-label="Perceived Difficulty from 1 to 10"
											className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="motivation">Motivation / Driver</label>
									<textarea
										id="motivation"
										value={formData.motivation}
										onChange={handleChange('motivation')}
										placeholder="Why do you want to complete this project?"
										aria-label="Motivation or Driver"
										rows={3}
										className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="known-obstacles">Known Obstacles</label>
									<textarea
										id="known-obstacles"
										value={formData.knownObstacles}
										onChange={handleChange('knownObstacles')}
										placeholder="List any known challenges, roadblocks, or fears..."
										aria-label="Known Obstacles"
										rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
                />
              </div>
              <div>
									<label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="skills-input">Skills / Resources Needed</label>
									<div className="flex gap-2">
										<input
											id="skills-input"
											type="text"
											value={skillsInput}
											onChange={(e) => setSkillsInput(e.target.value)}
											onKeyDown={handleSkillsKeyDown}
											placeholder="e.g., Learn Python, Hire a designer (press Enter or use commas)"
											aria-label="Skills or Resources Needed"
											className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
										/>
										<button
											onClick={handleAddSkillsFromInput}
											className="px-4 py-3 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 rounded-lg transition-colors"
											aria-label="Add skill or resource"
										>
											Add
										</button>
									</div>
									{formData.skillsResourcesNeeded.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-3">
											{formData.skillsResourcesNeeded.map((skill) => (
                    <button
													key={skill}
													onClick={() => handleRemoveSkill(skill)}
													className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-200 border border-blue-500/30 hover:bg-blue-500/30"
													aria-label={`Remove ${skill}`}
												>
													{skill} ✕
												</button>
											))}
										</div>
									)}
                </div>
              </div>

							<div className="flex gap-3 pt-2">
                <button
									onClick={handleSubmit}
									disabled={isSubmitDisabled}
									className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
										isSubmitDisabled
											? 'bg-gray-700/60 text-gray-300 cursor-not-allowed'
											: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white'
									}`}
									aria-label="Create Project"
								>
									{loading ? 'Creating...' : 'Create Project'}
                </button>
                <button
									onClick={handleCancel}
									className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg font-medium transition-all duration-200"
									aria-label="Cancel project creation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((p) => (
						<ProjectCard
							key={p.id}
							project={p}
							isOpen={openProjectId === p.id}
							onOpen={() => setOpenProjectId(p.id)}
							onClose={() => setOpenProjectId(null)}
							onUpdated={refreshProjects}
							onDeleted={refreshProjects}
						/>
					))}
        </div>
      </div>
    </div>
  );
};

export default Projects;

// Project Card with view/edit/delete
type ProjectCardProps = { project: DbProject; isOpen: boolean; onOpen: () => void; onClose: () => void; onUpdated: () => void; onDeleted: () => void };
const ProjectCard: React.FC<ProjectCardProps> = ({ project, isOpen, onOpen, onClose, onUpdated, onDeleted }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(project.title);
	const [description, setDescription] = useState(project.description);
	const [date, setDate] = useState(project.target_completion_date.substring(0, 10));
	const [category, setCategory] = useState(project.category || '');
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		try {
			await updateProject(project.id, {
				title,
				description,
				target_completion_date: date,
				category: category || null,
			});
			setIsEditing(false);
			onUpdated();
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
		await deleteProject(project.id);
		onDeleted();
	};

	return (
		<div className="bg-gray-900/30 backdrop-blur-xl border rounded-xl p-6 border-gray-700/30 hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()} aria-label={`Open ${project.title}`}>
			<div className="flex items-center justify-between mb-3 text-gray-300">
				<div className="flex items-center gap-2">
					<FolderOpen className="w-5 h-5" />
					<div className="font-semibold text-left">{project.title}</div>
				</div>
				<div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
					<button onClick={() => setIsEditing(true)} className="p-2 rounded bg-gray-800/50 border border-gray-700/40 hover:bg-gray-700/50" aria-label="Edit">
						<Pencil className="w-4 h-4" />
					</button>
					<button onClick={handleDelete} className="p-2 rounded bg-gray-800/50 border border-gray-700/40 hover:bg-gray-700/50" aria-label="Delete">
						<Trash2 className="w-4 h-4 text-red-400" />
					</button>
				</div>
			</div>
			<p className="text-sm text-gray-400 line-clamp-3 mb-4">{project.description}</p>
			<div className="flex items-center justify-between text-xs text-gray-400">
				<span>Due: {new Date(project.target_completion_date).toLocaleDateString()}</span>
				{project.category && <span className="px-2 py-1 rounded bg-gray-800/50 border border-gray-700/40 text-gray-300">{project.category}</span>}
			</div>

			{isOpen && (
				<ModalPortal>
					<div className="fixed inset-0 z-[100] flex items-center justify-center">
						<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
						<div className="relative w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-gray-900 border border-gray-700 rounded-2xl p-6 md:p-8 mx-auto" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-start justify-between mb-6">
							<div className="flex items-center gap-3">
								<FolderOpen className="w-7 h-7 text-gray-300" />
								<h3 className="text-3xl font-semibold text-white leading-tight">{project.title}</h3>
							</div>
							<button onClick={onClose} className="p-2 rounded hover:bg-gray-800/80" aria-label="Close"><X className="w-4 h-4 text-gray-400" /></button>
						</div>

						{/* Meta badges */}
						<div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
							<span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/50 text-gray-200">Due {new Date(project.target_completion_date).toLocaleDateString()}</span>
							{project.category && (
								<span className="px-2 py-1 rounded bg-gray-800/60 border border-gray-700/50 text-gray-200">{project.category}</span>
							)}
							{typeof project.perceived_difficulty === 'number' && (
								<span className="px-2 py-1 rounded bg-indigo-600/20 border border-indigo-500/40 text-indigo-200">Difficulty {project.perceived_difficulty}</span>
							)}
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-gray-300">
							{/* Left: Description */}
							<div>
								<p className="text-sm text-gray-400 mb-2">Description</p>
								<p className="text-[15px] leading-7 whitespace-pre-wrap break-words">{project.description || '—'}</p>
							</div>
							{/* Right: Motivation / Obstacles */}
							<div className="space-y-6">
								<div>
									<p className="text-sm text-gray-400 mb-2">Motivation</p>
									<p className="text-[15px] leading-7 whitespace-pre-wrap break-words">{project.motivation || '—'}</p>
								</div>
								<div>
									<p className="text-sm text-gray-400 mb-2">Known Obstacles</p>
									<p className="text-[15px] leading-7 whitespace-pre-wrap break-words">{project.known_obstacles || '—'}</p>
								</div>
							</div>
						</div>

						{project.skills_resources_needed && project.skills_resources_needed.length > 0 && (
							<div className="mt-6">
								<p className="text-sm text-gray-400 mb-2">Skills / Resources Needed</p>
								<div className="flex flex-wrap gap-2">
									{project.skills_resources_needed.map((s) => (
										<span key={s} className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs">{s}</span>
									))}
								</div>
							</div>
						)}
						</div>
					</div>
				</ModalPortal>
			)}

			{isEditing && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl p-6">
						<div className="flex items-center justify-between mb-4">
							<h4 className="text-lg font-semibold text-white">Edit Project</h4>
							<button onClick={() => setIsEditing(false)} aria-label="Close" className="p-2 rounded hover:bg-gray-800/80"><X className="w-4 h-4 text-gray-400" /></button>
						</div>
						<div className="space-y-3">
							<input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded text-white" placeholder="Title" />
							<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded text-white" rows={4} placeholder="Description" />
							<div className="grid grid-cols-2 gap-3">
								<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded text-white" />
								<select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded text-white">
									<option value="">No category</option>
									<option value="Professional">Professional</option>
									<option value="Personal">Personal</option>
									<option value="Learning">Learning</option>
									<option value="Other">Other</option>
								</select>
							</div>
							<div className="flex items-center justify-end gap-2 pt-2">
								<button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-800/70 rounded text-gray-300">Cancel</button>
								<button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-teal-600 text-white">{saving ? 'Saving...' : 'Save'}</button>
							</div>
						</div>
					</div>
				</div>
				)}
		</div>
	);
};

// Small info row for modal
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
	<div>
		<p className="text-sm text-gray-400 mb-1">{label}</p>
		<p className="text-sm text-white">{value}</p>
	</div>
);