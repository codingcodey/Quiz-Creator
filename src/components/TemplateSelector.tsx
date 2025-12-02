import { useState } from 'react';
import { QUIZ_TEMPLATES, getAllCategories, type QuizTemplate } from '../data/templates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: QuizTemplate) => void;
  onCreateBlank?: () => void;
}

export function TemplateSelector({ isOpen, onClose, onSelectTemplate, onCreateBlank }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();

  const filteredTemplates = selectedCategory
    ? QUIZ_TEMPLATES.filter((t) => t.category === selectedCategory)
    : QUIZ_TEMPLATES;

  if (!isOpen) return null;

  // Get icon for settings feature
  const getSettingIcon = (setting: string) => {
    switch (setting.toLowerCase()) {
      case 'timer': return '⏱️';
      case 'shuffle': return '🔀';
      case 'hints': return '💡';
      case 'explanations': return '📖';
      default: return '⚙️';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop">
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-2xl animate-modal max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-2xl text-text-primary">Choose a Template</h3>
            <p className="text-text-secondary text-sm mt-1">Start with a pre-built quiz or create from scratch</p>
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

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-accent text-bg-primary'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80'
            }`}
          >
            All Templates
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-accent text-bg-primary'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Start from Scratch option - always first */}
            {onCreateBlank && !selectedCategory && (
              <button
                onClick={onCreateBlank}
                className="group p-5 bg-accent/10 border-2 border-dashed border-accent/40 rounded-xl text-left hover:border-accent hover:bg-accent/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 opacity-0 animate-fade-in-up"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h4 className="font-medium text-accent">
                  Start from Scratch
                </h4>
                <p className="text-sm text-text-secondary mt-1">
                  Create a blank quiz with full customization
                </p>
              </button>
            )}

            {filteredTemplates.map((template, index) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="group p-5 bg-bg-tertiary border border-border rounded-xl text-left hover:border-accent/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {template.icon}
                </div>

                {/* Title */}
                <h4 className="font-medium text-text-primary group-hover:text-accent transition-colors">
                  {template.name}
                </h4>

                {/* Description */}
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {template.description}
                </p>

                {/* Customization Hints - show for templates with customization options */}
                {template.customizationHints && template.customizationHints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.customizationHints.map((hint) => (
                      <span
                        key={hint}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-md"
                        title={`Customize: ${hint}`}
                      >
                        <span>{getSettingIcon(hint)}</span>
                        <span>{hint}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Settings Indicators for pre-configured templates */}
                {!template.customizationHints && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.quiz.settings.timerEnabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-md">
                        ⏱️ Timed
                      </span>
                    )}
                    {template.quiz.settings.shuffleQuestions && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-md">
                        🔀 Shuffle Q
                      </span>
                    )}
                    {template.quiz.settings.shuffleOptions && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-md">
                        🔀 Shuffle A
                      </span>
                    )}
                    {template.quiz.settings.showHints && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-md">
                        💡 Hints
                      </span>
                    )}
                  </div>
                )}

                {/* Category Badge & Question Count */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 text-xs bg-bg-secondary rounded-lg text-text-muted">
                    {template.category}
                  </span>
                  {template.quiz.questions.length > 0 && (
                    <span className="px-2 py-1 text-xs bg-accent/20 rounded-lg text-accent">
                      {template.quiz.questions.length} questions
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
          <p className="text-sm text-text-muted">
            {filteredTemplates.length} templates available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
