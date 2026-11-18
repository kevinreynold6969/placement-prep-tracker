import React from 'react';
import { PlusCircle, Search, RefreshCw, FolderSearch } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records matching your request.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-12 rounded-2xl bg-panel/40 border border-dashed border-line text-center space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-mist/80 border border-line/60 flex items-center justify-center text-muted mx-auto">
        <Icon className="w-6 h-6 text-muted" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-punch-600 text-button text-xs font-bold hover:bg-punch-500 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
