import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[rgba(14,8,22,0.7)] backdrop-blur-xl border-t border-[rgba(168,85,247,0.12)]">
      <div className="flex justify-between sm:hidden w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-mono text-[#A8A0B8]">
            PAGE <span className="font-bold text-white">{currentPage}</span> OF{' '}
            <span className="font-bold text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px overflow-hidden border border-[rgba(168,85,247,0.2)] bg-black/40" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 border-r border-[rgba(168,85,247,0.15)] bg-white/[0.02] text-xs font-medium text-[#A8A0B8] hover:text-white hover:bg-purple-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`relative inline-flex items-center px-3.5 py-2 text-xs font-mono font-bold border-r border-[rgba(168,85,247,0.15)] transition-all ${
                  currentPage === i + 1
                    ? 'z-10 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-white/[0.02] text-[#A8A0B8] hover:bg-purple-500/15 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 bg-white/[0.02] text-xs font-medium text-[#A8A0B8] hover:text-white hover:bg-purple-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
