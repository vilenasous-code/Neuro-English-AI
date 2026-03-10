import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  actionIcon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLink,
  actionIcon = <Plus size={20} />
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 text-zinc-400">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-zinc-400 text-lg max-w-md mb-6">
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
          {actionIcon}
          {actionText}
        </Link>
      )}
    </div>
  );
};
