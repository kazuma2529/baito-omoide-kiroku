import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="新しいバイト記録を追加"
      className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-[#ff8e88] hover:bg-[#f07c76] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#ff8e88]/30 border-2 border-white/50"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
};

