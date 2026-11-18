import React from 'react';

export const DifficultyBadge = ({ difficulty }) => {
  const configs = {
    Easy: 'bg-punch-500/10 text-punk-500 border-punch-500/20',
    Medium: 'bg-punk-500/10 text-punk-700 border-punk-500',
    Hard: 'bg-punch-500/10 text-ink border-punch-500/30',
  };

  const style = configs[difficulty] || 'bg-mist text-muted border-line';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {difficulty}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const configs = {
    solved: {
      label: 'Solved',
      style: 'bg-punch-500/10 text-punk-500 border-punch-500/30',
      dot: 'bg-punch-400',
    },
    attempted: {
      label: 'Attempted',
      style: 'bg-punk-500/10 text-punk-700 border-punk-500',
      dot: 'bg-punk-500',
    },
    needs_revision: {
      label: 'Needs Revision',
      style: 'bg-punch-500/10 text-ink border-punch-500/30',
      dot: 'bg-punch-500',
    },
    not_attempted: {
      label: 'Not Attempted',
      style: 'bg-mist/80 text-muted border-line',
      dot: 'bg-subtle',
    },
  };

  const config = configs[status] || configs['not_attempted'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const PlatformBadge = ({ platform }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-panel border border-line text-[11px] font-mono text-muted">
      {platform}
    </span>
  );
};
