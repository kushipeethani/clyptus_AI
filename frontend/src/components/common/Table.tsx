import React from 'react';
import { cn } from '../../utils/tw';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-[20px] border border-[rgba(168,85,247,0.18)] bg-[rgba(16,10,26,0.65)] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <table className={cn('min-w-full divide-y divide-[rgba(168,85,247,0.12)] text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-white/[0.025] border-b border-[rgba(168,85,247,0.14)]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-white/[0.04] bg-transparent', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('hover:bg-purple-600/[0.08] transition-colors duration-150', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('px-6 py-4 text-left text-[11px] font-mono font-bold text-[#A8A0B8] uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-[#F8F7FF]', className)} {...props}>
      {children}
    </td>
  );
}
