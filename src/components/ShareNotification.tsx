import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ShareNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareNotification({ isOpen, onClose }: ShareNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);

      const closeTimer = setTimeout(() => {
        onClose();
      }, 6300);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-4 px-5 py-4 bg-bg-secondary border border-border rounded-xl shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 max-w-sm">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">Quiz shared!</p>
          <p className="text-xs text-text-secondary">Your quiz is now public and can be found in Explore.</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="flex-shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
