import React, { useState } from 'react';
import { PenTool, Save } from 'lucide-react';
import { createJournalEntry } from '../integrations/supabase/journal';

type Props = {
  currentProjectId?: string | null;
};

const JournalModule: React.FC<Props> = ({ currentProjectId }) => {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await createJournalEntry({
        project_id: currentProjectId ?? null,
        title: 'Quick note',
        content: note.trim(),
        mood: 'neutral',
        energy: null,
        focus: null,
      });
      setNote('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Quick journaling failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300 flex items-center space-x-2">
          <PenTool className="w-5 h-5 text-green-400" />
          <span>Quick Journaling</span>
        </h3>
      </div>

      <div className="space-y-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind? Jot down your thoughts, ideas, or reflections..."
          className="w-full h-32 bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-200"
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!note.trim() || isSaving}
            className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
              !note.trim() || isSaving
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalModule;