import React from 'react';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';

  switch (status) {
    case 'New':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-[#D8B4FE] border border-[rgba(184,107,255,0.4)] shadow-[0_0_12px_rgba(168,85,247,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B86BFF] shadow-[0_0_6px_#B86BFF] animate-pulse" />
          NEW
        </span>
      );
    case 'Under Review':
      variant = 'warning';
      break;
    case 'Shortlisted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 text-[#D8B4FE] border border-[rgba(184,107,255,0.45)] shadow-[0_0_14px_rgba(184,107,255,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8B4FE] shadow-[0_0_6px_#D8B4FE]" />
          {status}
        </span>
      );
    case 'Interview Scheduled':
      variant = 'primary';
      break;
    case 'Selected':
      variant = 'success';
      break;
    case 'Rejected':
      variant = 'danger';
      break;
    default:
      variant = 'default';
  }

  return (
    <Badge variant={variant} dot>
      {status}
    </Badge>
  );
}
