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
const MODAL_STATE_KEY = 'deprocast_project_modal_state';

export const useProjectFormPersistence = () => {
	const [formData, setFormData] = useState<NewProjectFormData>(initialFormState);
	const [skillsInput, setSkillsInput] = useState('');
	const [showCreateForm, setShowCreateForm] = useState(false);

	// Load form data and modal state from localStorage on mount
	useEffect(() => {
		try {
			const savedData = localStorage.getItem(STORAGE_KEY);
			const savedModalState = localStorage.getItem(MODAL_STATE_KEY);
			
			if (savedData) {
				const parsedData = JSON.parse(savedData);
				setFormData(parsedData);
				
				// Check if there's draft data and auto-open modal if needed
				const hasContent = parsedData.title.trim() || 
								  parsedData.description.trim() || 
								  parsedData.targetCompletionDate.trim() ||
								  parsedData.motivation?.trim() ||
								  parsedData.knownObstacles?.trim() ||
								  parsedData.skillsResourcesNeeded.length > 0;
				
				if (hasContent && savedModalState === 'true') {
					setShowCreateForm(true);
				}
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
		localStorage.removeItem(MODAL_STATE_KEY);
	}, []);

	// Handle opening the form
	const handleOpenForm = useCallback(() => {
		setShowCreateForm(true);
		localStorage.setItem(MODAL_STATE_KEY, 'true');
	}, []);

	// Handle canceling the form
	const handleCancel = useCallback(() => {
		setShowCreateForm(false);
		localStorage.setItem(MODAL_STATE_KEY, 'false');
		// Don't reset form data immediately - let user decide
	}, []);

	// Handle confirming cancellation (actually reset the form)
	const handleConfirmCancel = useCallback(() => {
		setShowCreateForm(false);
		localStorage.removeItem(MODAL_STATE_KEY);
		resetFormData();
	}, []);

	// Handle successful form submission
	const handleSubmitSuccess = useCallback(() => {
		setShowCreateForm(false);
		localStorage.removeItem(MODAL_STATE_KEY);
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
