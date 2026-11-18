import React, { useState } from 'react';
import { X, ExternalLink, Calendar, Clock, Edit2, RotateCcw, CheckCircle2, Bookmark, Cpu } from 'lucide-react';
import { DifficultyBadge, StatusBadge, PlatformBadge } from '../common/StatusBadge';
import api from '../../api/axios';

const ProblemDetailModal = ({ isOpen, onClose, problem, onEdit, onUpdateSuccess }) => {
  const [togglingRevision, setTogglingRevision] = useState(false);

  if (!isOpen || !problem) return null;

  const handleToggleRevision = async () => {
    try {
      setTogglingRevision(true);
      const newNeedsRevision = !problem.needsRevision;
      await api.put(`/problems/${problem._id}`, {
        needsRevision: newNeedsRevision,
        revisedAt: newNeedsRevision ? null : new Date(),
      });
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update revision status:', err);
    } finally {
      setTogglingRevision(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl neo-card bg-panel p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <PlatformBadge platform={problem.platform} />
              <DifficultyBadge difficulty={problem.difficulty} />
              <StatusBadge status={problem.status} />
              {problem.needsRevision && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-punch-500/10 text-ink border border-punch-500/30">
                  <Bookmark className="w-3 h-3 fill-punch-500" />
                  Revision Backlog
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
              {problem.title}
              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open external problem link"
                  className="text-subtle hover:text-punk-500 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-mist transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-paper border border-line/80">
            <span className="text-subtle font-mono block">DSA Topic</span>
            <span className="font-semibold text-ink mt-0.5 block">{problem.topic}</span>
          </div>

          <div className="p-3 rounded-xl bg-paper border border-line/80">
            <span className="text-subtle font-mono block">Time Complexity</span>
            <span className="font-mono text-punk-500 font-medium mt-0.5 block">
              {problem.timeComplexity || 'Not recorded'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-paper border border-line/80">
            <span className="text-subtle font-mono block">Space Complexity</span>
            <span className="font-mono text-punk-500 font-medium mt-0.5 block">
              {problem.spaceComplexity || 'Not recorded'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-paper border border-line/80">
            <span className="text-subtle font-mono block">Date Attempted</span>
            <span className="text-muted font-medium mt-0.5 block">
              {problem.dateAttempted
                ? new Date(problem.dateAttempted).toLocaleDateString()
                : 'Not recorded'}
            </span>
          </div>
        </div>

        {/* Solution Approach */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-punk-500" />
            Solution Approach & Algorithm
          </h3>
          <div className="p-4 rounded-xl bg-paper border border-line/80 text-xs sm:text-sm text-muted leading-relaxed font-sans whitespace-pre-line">
            {problem.approach || (
              <span className="text-subtle italic">No solution approach summary recorded yet.</span>
            )}
          </div>
        </div>

        {/* Mistakes & Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-punk-700" />
            Personal Mistakes & Revision Notes
          </h3>
          <div className="p-4 rounded-xl bg-paper/80 border border-line/80 text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-line">
            {problem.notes || (
              <span className="text-subtle italic">No mistakes or revision notes recorded.</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line text-xs">
          <button
            type="button"
            disabled={togglingRevision}
            onClick={handleToggleRevision}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              problem.needsRevision
                ? 'bg-punch-500/10 border-punch-500/30 text-punk-500 hover:bg-punch-500/20'
                : 'bg-punch-500/10 border-punch-500/30 text-ink hover:bg-punch-500/20'
            }`}
          >
            {problem.needsRevision ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Revised (Clear Backlog Flag)</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Flag for Revision Backlog</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onClose();
                onEdit(problem);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-mist border border-line text-ink font-semibold hover:bg-mist transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-line text-muted hover:text-ink hover:bg-mist transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailModal;
