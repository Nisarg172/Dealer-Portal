'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

type SessionExpiredModalProps = {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export default function SessionExpiredModal({
  isOpen,
  onConfirm,
  isSubmitting = false,
  title = 'Session Expired',
  description = 'Your session has expired. Please login again to continue.',
  confirmLabel = 'Login Again',
}: SessionExpiredModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-[310] flex items-center justify-center px-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <FiAlertCircle size={28} />
              </div>
              <h2 className="text-center text-xl font-black text-slate-900">{title}</h2>
              <p className="mt-2 text-center text-sm text-slate-600">{description}</p>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <FiLoader className="animate-spin" /> : null}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
