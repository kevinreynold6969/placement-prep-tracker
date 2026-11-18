import React from 'react';

const MetricCard = ({ title, value, sublabel, icon: Icon, color = 'emerald' }) => {
  const colorStyles = {
    emerald: 'text-punk-500 bg-punch-500/10 border-punch-500/20',
    amber: 'text-punk-700 bg-punk-500/10 border-punk-500',
    rose: 'text-ink bg-punch-500/10 border-punch-500/30',
    zinc: 'text-muted bg-mist border-line',
  };

  return (
    <div className="neo-card space-y-2 bg-panel p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${colorStyles[color] || colorStyles.zinc}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold text-ink tracking-tight">{value}</div>
      {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
    </div>
  );
};

export default MetricCard;
