import React from 'react';
import { Eye, Edit2, Trash2, Bookmark, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { DifficultyBadge, StatusBadge, PlatformBadge } from '../common/StatusBadge';

const ProblemTable = ({
  problems,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleRevision,
}) => {
  return (
    <div className="neo-card terminal-panel overflow-hidden">
      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-paper/80 border-b border-line text-muted font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-4">DSA Topic</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Complexity</th>
              <th className="py-3 px-4">Attempted</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {problems.map((p) => (
              <tr key={p._id} className="hover:bg-mist/30 transition-colors group">
                {/* Title & Platform */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PlatformBadge platform={p.platform} />
                    <button
                      onClick={() => onView(p)}
                      className="font-bold text-ink hover:text-punk-500 text-sm transition-colors text-left"
                    >
                      {p.title}
                    </button>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-subtle hover:text-muted transition-colors"
                        title="Open external problem link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.needsRevision && (
                      <span className="p-1 rounded bg-punch-500/10 text-ink text-[10px]" title="Marked for revision">
                        <Bookmark className="w-3 h-3 fill-punch-500" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Topic */}
                <td className="py-3.5 px-4 font-medium text-muted">
                  <span className="px-2 py-0.5 rounded bg-paper border border-line">
                    {p.topic}
                  </span>
                </td>

                {/* Difficulty */}
                <td className="py-3.5 px-4">
                  <DifficultyBadge difficulty={p.difficulty} />
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <StatusBadge status={p.status} />
                </td>

                {/* Complexity */}
                <td className="py-3.5 px-4 font-mono text-[11px] text-muted">
                  {p.timeComplexity ? (
                    <span className="text-punk-500">{p.timeComplexity}</span>
                  ) : (
                    <span className="text-subtle">ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span>
                  )}
                </td>

                {/* Date Attempted */}
                <td className="py-3.5 px-4 text-muted font-mono text-[11px]">
                  {p.dateAttempted
                    ? new Date(p.dateAttempted).toLocaleDateString()
                    : <span className="text-subtle">ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span>}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(p)}
                      title="View problem notes & approach"
                      className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-mist transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleRevision(p)}
                      title={p.needsRevision ? 'Remove from revision backlog' : 'Add to revision backlog'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.needsRevision
                          ? 'text-ink hover:bg-punch-500/10'
                          : 'text-subtle hover:text-ink hover:bg-mist'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${p.needsRevision ? 'fill-punch-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onEdit(p)}
                      title="Edit record"
                      className="p-1.5 rounded-lg text-muted hover:text-punk-500 hover:bg-mist transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(p)}
                      title="Delete record"
                      className="p-1.5 rounded-lg text-subtle hover:text-ink hover:bg-mist transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 bg-paper/80 border-t border-line flex items-center justify-between text-xs text-muted">
          <div>
            Showing page <span className="font-semibold text-ink">{pagination.page}</span> of{' '}
            <span className="font-semibold text-ink">{pagination.totalPages}</span> ({pagination.total} total problems)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line hover:bg-mist text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line hover:bg-mist text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemTable;
