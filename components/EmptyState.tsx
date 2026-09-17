import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-slate-600 mb-4 bg-slate-800/30 p-4 rounded-full border border-white/5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-[280px] mx-auto mb-6">
        {subtitle}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-amber-300/10 text-amber-300 border border-amber-300/20 px-6 py-2.5 rounded-xl font-medium hover:bg-amber-300/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
