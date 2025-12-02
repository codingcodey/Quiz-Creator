import { useState, useEffect } from 'react';
import type { QuizSettings } from '../types/quiz';

interface QuizSettingsModalProps {
  settings: QuizSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: QuizSettings) => void;
}

export function QuizSettingsModal({ settings, isOpen, onClose, onSave }: QuizSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<QuizSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateSetting = <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop">
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl animate-modal max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-text-primary">Quiz Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Timer Section */}
          <section>
            <h4 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timer
            </h4>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer group">
                <div>
                  <p className="text-text-primary font-medium">Enable Timer</p>
                  <p className="text-sm text-text-muted">Add time pressure to your quiz</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.timerEnabled}
                  onChange={(e) => updateSetting('timerEnabled', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                />
              </label>

              {localSettings.timerEnabled && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Time per Question</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={localSettings.timePerQuestion || ''}
                        onChange={(e) => updateSetting('timePerQuestion', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="30"
                        min="5"
                        max="300"
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                      />
                      <span className="text-text-muted text-sm">sec</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Total Time Limit</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={localSettings.totalTimeLimit ? Math.floor(localSettings.totalTimeLimit / 60) : ''}
                        onChange={(e) => updateSetting('totalTimeLimit', e.target.value ? parseInt(e.target.value) * 60 : undefined)}
                        placeholder="10"
                        min="1"
                        max="180"
                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                      />
                      <span className="text-text-muted text-sm">min</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Randomization Section */}
          <section>
            <h4 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Randomization
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer">
                <div>
                  <p className="text-text-primary font-medium">Shuffle Questions</p>
                  <p className="text-sm text-text-muted">Randomize question order each time</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.shuffleQuestions}
                  onChange={(e) => updateSetting('shuffleQuestions', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer">
                <div>
                  <p className="text-text-primary font-medium">Shuffle Answer Options</p>
                  <p className="text-sm text-text-muted">Randomize option order for each question</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.shuffleOptions}
                  onChange={(e) => updateSetting('shuffleOptions', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* Hints & Explanations Section */}
          <section>
            <h4 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Help & Feedback
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer">
                <div>
                  <p className="text-text-primary font-medium">Show Hints</p>
                  <p className="text-sm text-text-muted">Allow players to request hints</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.showHints}
                  onChange={(e) => updateSetting('showHints', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer">
                <div>
                  <p className="text-text-primary font-medium">Show Explanations</p>
                  <p className="text-sm text-text-muted">Display answer explanations after submission</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.showExplanations}
                  onChange={(e) => updateSetting('showExplanations', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                />
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-shimmer px-5 py-2.5 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:translate-y-0 transition-all duration-300"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

