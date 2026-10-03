import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
};

const Modal = ({
  isOpen = true,
  title,
  subtitle,
  onClose,
  children,
  size = "md",
  footer,
  closeOnOverlay = true,
}) => {
  const closeButtonRef = useRef(null);
  const modalSize = SIZE_MAP[size] || SIZE_MAP.md;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            className={`my-auto flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 ${modalSize}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {(title || onClose) && (
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-black tracking-tight text-slate-950"
                    >
                      {title}
                    </h2>
                  )}

                  {subtitle && (
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {subtitle}
                    </p>
                  )}
                </div>

                {onClose && (
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-4 focus:ring-violet-500/15"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;