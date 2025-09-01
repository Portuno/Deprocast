import { useState, useEffect, useCallback } from 'react';

type ProjectCategory = 'Professional' | 'Personal' | 'Learning' | 'Other';

export type NewProjectFormData = {
	title: string;
	description: string;
	targetCompletionDate: string;
	category?: ProjectCategory;
	motivation?: string;
	perceivedDifficulty?: number;
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

const STORAGE_KEY = 'deprocast_project_form_draft';

export const useProjectFormPersistence = () => {
	const [formData, setFormData] = useState<NewProjectFormData>(initialFormState);
	const [skillsInput, setSkillsInput] = useState('');
	const [showCreateForm, setShowCreateForm] = useState(false);

	// Load form data from localStorage on mount
	useEffect(() => {
		try {
			const savedData = localStorage.getItem(STORAGE_KEY);
			if (savedData) {
				const parsedData = JSON.parse(savedData);
				setFormData(parsedData);
			}
		} catch (error) {
			console.warn('Failed to load project form data from localStorage:', error);
		}
	}, []);

	// Save form data to localStorage whenever it changes
	useEffect(() => {
		try {
			// Only save if there's actual content in the form
			const hasContent = formData.title.trim() || 
							  formData.description.trim() || 
							  formData.targetCompletionDate.trim() ||
							  formData.motivation?.trim() ||
							  formData.knownObstacles?.trim() ||
							  formData.skillsResourcesNeeded.length > 0;
			
			if (hasContent) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
			} else {
				// Clear localStorage if form is empty
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (error) {
			console.warn('Failed to save project form data to localStorage:', error);
		}
	}, [formData]);

	// Update form data
	const updateFormData = useCallback((updates: Partial<NewProjectFormData>) => {
		setFormData(prev => ({ ...prev, ...updates }));
	}, []);

	// Reset form data
	const resetFormData = useCallback(() => {
		setFormData(initialFormState);
		setSkillsInput('');
		localStorage.removeItem(STORAGE_KEY);
	}, []);

	// Handle opening the form
	const handleOpenForm = useCallback(() => {
		setShowCreateForm(true);
	}, []);

	// Handle canceling the form
	const handleCancel = useCallback(() => {
		setShowCreateForm(false);
		// Don't reset form data immediately - let user decide
	}, []);

	// Handle confirming cancellation (actually reset the form)
	const handleConfirmCancel = useCallback(() => {
		setShowCreateForm(false);
		resetFormData();
	}, []);

	// Handle successful form submission
	const handleSubmitSuccess = useCallback(() => {
		setShowCreateForm(false);
		resetFormData();
	}, []);

	return {
		formData,
		skillsInput,
		setSkillsInput,
		showCreateForm,
		updateFormData,
		resetFormData,
		handleOpenForm,
		handleCancel,
		handleConfirmCancel,
		handleSubmitSuccess,
		hasDraftData: formData.title.trim() || 
					 formData.description.trim() || 
					 formData.targetCompletionDate.trim() ||
					 formData.motivation?.trim() ||
					 formData.knownObstacles?.trim() ||
					 formData.skillsResourcesNeeded.length > 0
	};
};
