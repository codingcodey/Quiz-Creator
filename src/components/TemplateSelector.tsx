import { useState } from 'react';
import { QUIZ_TEMPLATES, getAllCategories, type QuizTemplate } from '../data/templates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: QuizTemplate) => void;
}

export function TemplateSelector({ isOpen, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();

  const filteredTemplates = selectedCategory
    ? QUIZ_TEMPLATES.filter((t) => t.category === selectedCategory)
    : QUIZ_TEMPLATES;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop">
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl animate-modal max-h-[85vh] overflow-hidden flex flex-col">
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

                {/* Category Badge */}
                <span className="inline-block mt-3 px-2 py-1 text-xs bg-bg-secondary rounded-lg text-text-muted">
                  {template.category}
                </span>

                {/* Question count */}
                {template.quiz.questions.length > 0 && (
                  <span className="inline-block ml-2 mt-3 px-2 py-1 text-xs bg-accent/20 rounded-lg text-accent">
                    {template.quiz.questions.length} questions
                  </span>
                )}
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

