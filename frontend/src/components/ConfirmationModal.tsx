import { X, AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const confirmColors = variant === "danger"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && !isLoading) onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-start justify-between p-4 border-b border-[#F1EFE8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-amber-600" strokeWidth={2} />
            </div>
            <h2 id="confirm-title" className="text-base font-medium text-gray-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0 ml-4"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="p-4">
          <p id="confirm-message" className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-[#F1EFE8]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${confirmColors} disabled:opacity-50`}
          >
            {isLoading ? "Confirming..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useConfirmation = () => {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "primary";
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onClose: () => {},
  });

  const confirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "primary";
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      onClose: () => setState((prev) => ({ ...prev, isOpen: false })),
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      variant: options.variant,
    });
  };

  const close = () => setState((prev) => ({ ...prev, isOpen: false }));

  return {
    ConfirmationModal: (
      <ConfirmationModal
        isOpen={state.isOpen}
        onClose={close}
        onConfirm={() => {
          state.onConfirm();
          close();
        }}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
      />
    ),
    confirm,
  };
};

import { useState } from "react";