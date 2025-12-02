import { useState, useEffect } from 'react';
import type { Quiz } from '../types/quiz';

interface ShareModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onEnableSharing: () => string;
  onDisableSharing: () => void;
}

export function ShareModal({ quiz, isOpen, onClose, onEnableSharing, onDisableSharing }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState(quiz.settings?.shareId || '');
  
  const isSharing = quiz.settings?.isPublic && shareId;
  const shareUrl = shareId ? `${window.location.origin}${window.location.pathname}?play=${shareId}` : '';

  useEffect(() => {
    setShareId(quiz.settings?.shareId || '');
  }, [quiz.settings?.shareId]);

  if (!isOpen) return null;

  const handleEnableSharing = () => {
    const newShareId = onEnableSharing();
    setShareId(newShareId);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDisableSharing = () => {
    onDisableSharing();
    setShareId('');
  };

  // Simple QR Code generator using a public API
  const qrCodeUrl = shareUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop">
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-text-primary">Share Quiz</h3>
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

        {/* Content */}
        {!isSharing ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-text-primary mb-2">Quiz is Private</h4>
            <p className="text-text-secondary text-sm mb-6">
              Enable sharing to let anyone play this quiz with a link or QR code.
            </p>
            <button
              onClick={handleEnableSharing}
              className="btn-shimmer px-6 py-3 bg-accent text-bg-primary rounded-xl font-medium hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:translate-y-0 transition-all duration-300"
            >
              Enable Sharing
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-xl">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Share Link */}
            <div>
              <label className="block text-sm text-text-muted mb-2">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-text-primary text-sm focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    copied
                      ? 'bg-success text-white'
                      : 'bg-bg-tertiary border border-border text-text-primary hover:border-accent/50 hover:text-accent'
                  }`}
                >
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Share Stats */}
            {quiz.playCount !== undefined && quiz.playCount > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-bg-tertiary rounded-xl">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-text-secondary">
                  Played <span className="text-accent font-medium">{quiz.playCount}</span> times
                </span>
              </div>
            )}

            {/* Disable Sharing */}
            <button
              onClick={handleDisableSharing}
              className="w-full py-3 text-error hover:bg-error/10 rounded-xl transition-colors text-sm"
            >
              Disable Sharing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

