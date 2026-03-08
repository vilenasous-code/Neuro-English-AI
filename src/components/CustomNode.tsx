import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

export const CustomNode = memo(({ data }: any) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl min-w-[200px] max-w-[300px] overflow-hidden group hover:border-purple-500 transition-colors">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500 border-2 border-zinc-900" />
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {data.category && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              {data.category}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-1">{data.label}</h3>
        
        {data.definition && (
          <p className="text-sm text-zinc-400 mb-3 leading-relaxed">
            {data.definition}
          </p>
        )}
        
        {data.example && (
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
            <p className="text-sm text-zinc-300 italic">
              "{data.example}"
            </p>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-zinc-900" />
    </div>
  );
});
