import React from 'react';
import { Layers, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window',
  'Prefix Sum', 'Binary Search', 'Sorting', 'Greedy', 'Stack', 'Queue',
  'Linked Lists', 'Trees', 'Binary Search Trees', 'Heaps', 'Graphs',
  'Backtracking', 'Dynamic Programming'
];

const TopicProgress = ({ topicStats = {}, topicBreakdown = [], onSelectTopic }) => {
  // Convert topicBreakdown array into a lookup map
  const breakdownMap = (topicBreakdown || []).reduce((acc, item) => {
    acc[item.topic] = item;
    return acc;
  }, {});

  return (
    <div className="neo-card space-y-6 bg-panel p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-line">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <Layers className="w-4 h-4 text-punk-500" />
            DSA Curriculum Coverage (18 Canonical Topics)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Real progress derived from your recorded problem attempts across the standard placement syllabus.
          </p>
        </div>
        <div className="text-[11px] font-mono text-muted flex items-center gap-1.5 bg-paper px-2.5 py-1 rounded-lg border border-line">
          <Info className="w-3.5 h-3.5 text-muted" />
          <span>Click any topic to filter</span>
        </div>
      </div>

      {/* Grid of 18 Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {DSA_TOPICS.map((topic) => {
          const data = breakdownMap[topic] || { total: topicStats[topic] || 0, solved: 0, needsRevision: 0, attempted: 0 };
          const total = data.total || 0;
          const solved = data.solved || 0;
          const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

          // Transparent weakness / focus indicator:
          // We strictly require at least 3 attempted problems with < 50% solved ratio
          const needsFocus = total >= 3 && percentage < 50;

          return (
            <div
              key={topic}
              onClick={() => onSelectTopic && onSelectTopic(topic)}
              className="rounded-lg border-2 border-black bg-paper p-3.5 shadow-neo-sm transition-transform hover:-translate-y-0.5 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink group-hover:text-punk-500 transition-colors">
                  {topic}
                </span>
                <span className="text-[11px] font-mono text-muted">
                  <strong className="text-ink">{solved}</strong> / {total} solved
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-panel overflow-hidden">
                <div
                  className="h-full bg-punch-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted">
                <span>{percentage}% solved ratio</span>
                {needsFocus && (
                  <span className="inline-flex items-center gap-1 text-punk-700 font-medium" title="Based on recorded activity: >=3 problems logged with <50% solved">
                    <AlertTriangle className="w-3 h-3" />
                    Needs Focus
                  </span>
                )}
                {total === 0 && (
                  <span className="text-subtle italic">Not attempted</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Focus Area Explanation Notice */}
      <div className="p-3.5 rounded-xl bg-paper/50 border border-line/60 text-xs text-muted flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-punk-500 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-ink">How Focus Area is Calculated:</strong> A topic is highlighted as <em>"Needs Focus"</em> only when a candidate has logged at least 3 problems in that topic and solved fewer than 50% of them. This metric reflects recorded practice history, not an arbitrary judgment of ability.
        </p>
      </div>
    </div>
  );
};

export default TopicProgress;
