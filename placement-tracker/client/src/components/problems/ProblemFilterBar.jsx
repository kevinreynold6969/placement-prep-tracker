import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window',
  'Prefix Sum', 'Binary Search', 'Sorting', 'Greedy', 'Stack', 'Queue',
  'Linked Lists', 'Trees', 'Binary Search Trees', 'Heaps', 'Graphs',
  'Backtracking', 'Dynamic Programming'
];

const ProblemFilterBar = ({ filters, onChange, onClear }) => {
  const hasActiveFilters =
    filters.search ||
    filters.topic ||
    filters.difficulty ||
    filters.status ||
    filters.sortBy !== 'createdAt';

  return (
    <div className="neo-card bg-panel p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-subtle">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Search problems by title..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-paper border border-line text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-punch-500"
          />
          {filters.search && (
            <button
              onClick={() => onChange('search', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle hover:text-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Topic Filter */}
        <div>
          <select
            value={filters.topic}
            onChange={(e) => onChange('topic', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-xs text-ink focus:outline-none focus:border-punch-500"
          >
            <option value="">All DSA Topics ({DSA_TOPICS.length})</option>
            {DSA_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={filters.difficulty}
            onChange={(e) => onChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-xs text-ink focus:outline-none focus:border-punch-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-xs text-ink focus:outline-none focus:border-punch-500"
          >
            <option value="">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="not_attempted">Not Attempted</option>
          </select>
        </div>
      </div>

      {/* Second row: Sort and Clear */}
      <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs text-muted">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-subtle" />
          <span className="text-[11px] font-mono uppercase text-subtle">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="px-2 py-1 rounded-lg bg-paper border border-line text-xs text-muted focus:outline-none focus:border-punch-500"
          >
            <option value="createdAt">Date Recorded (Newest First)</option>
            <option value="dateAttempted">Date Attempted</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Problem Title (A-Z)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-muted hover:text-ink hover:bg-mist transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProblemFilterBar;
