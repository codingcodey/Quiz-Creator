import { useState } from 'react';
import { ImageUploader } from './ImageUploader';

interface CreateQuizFormProps {
  onSubmit: (data: { title: string; description: string; coverImage?: string }) => void;
  onCancel: () => void;
}

export function CreateQuizForm({ onSubmit, onCancel }: CreateQuizFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>();

  const canSubmit = title.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      coverImage,
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 opacity-0 animate-fade-in-up stagger-1">
          <h1 className="font-serif text-4xl md:text-5xl text-text-primary">
            Create a New Quiz
          </h1>
          <p className="mt-3 text-text-secondary">
            Give your quiz a title and optional details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <div className="opacity-0 animate-fade-in-up stagger-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Cover Image
              <span className="text-text-muted ml-1">(optional)</span>
            </label>
            <ImageUploader
              image={coverImage}
              onImageChange={setCoverImage}
              className="h-48"
              placeholder="Drag and drop or click to add cover image"
            />
          </div>

          {/* Title */}
          <div className="opacity-0 animate-fade-in-up stagger-3">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title
              <span className="text-error ml-1">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a descriptive title"
              className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="opacity-0 animate-fade-in-up stagger-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
              <span className="text-text-muted ml-1">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell users about your question set"
              rows={4}
              className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 opacity-0 animate-fade-in-up stagger-5">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                canSubmit
                  ? 'bg-accent text-bg-primary hover:bg-accent-hover hover:scale-105 active:scale-100'
                  : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }`}
            >
              Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

