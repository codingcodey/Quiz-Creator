import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, children, maxWidth = 'md' }: ModalProps) {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const modalContent = (
    <div
      className="modal-backdrop fixed inset-0 z-[200] bg-black/70 backdrop-blur-md animate-backdrop"
      onClick={onClose}
    >
      <div
        className={`bg-bg-secondary border border-border-subtle rounded-3xl p-6 sm:p-8 ${maxWidthClasses[maxWidth]} w-full mx-4 shadow-2xl animate-modal overflow-y-auto card-elevated`}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: 'calc(100vh - 2rem)',
          margin: 0,
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
}: ConfirmationModalProps) {
  const variantColors = {
    danger: {
      bg: 'bg-error/20',
      text: 'text-error',
      button: 'bg-error hover:bg-error/90',
    },
    warning: {
      bg: 'bg-warning/20',
      text: 'text-warning',
      button: 'bg-warning hover:bg-warning/90',
    },
    info: {
      bg: 'bg-accent/20',
      text: 'text-accent',
      button: 'bg-accent hover:bg-accent-hover',
    },
  };

  const colors = variantColors[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
          {icon || (
            <svg className={`w-5 h-5 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <h3 className="font-serif text-xl text-text-primary">{title}</h3>
      </div>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-text-secondary hover:text-text-primary transition-all duration-300"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2.5 ${colors.button} text-bg-primary rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-300`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
