import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const DeleteConfirmModal = ({ isOpen, onClose, problem, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !problem) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await api.delete(`/problems/${problem._id}`);
      onDeleteSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete problem record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md neo-card bg-panel p-6 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-punch-500/10 border border-punch-500/30 flex items-center justify-center text-ink">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-ink">Delete Problem Record?</h3>
          <p className="text-xs text-muted leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-ink font-semibold">"{problem.title}"</strong>? This will permanently remove your approach notes, complexity logs, and revision flags.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-punch-500/10 border border-punch-500/30 text-xs text-ink">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-muted hover:text-ink hover:bg-mist transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-punch-600 text-button text-xs font-bold hover:bg-punch-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
