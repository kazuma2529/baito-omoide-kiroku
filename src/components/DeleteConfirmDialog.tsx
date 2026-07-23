import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-xl text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#2B2D42] mb-2">
          記録を削除しますか？
        </h3>

        <p className="text-sm text-[#6C757D] mb-6 leading-relaxed">
          「<span className="font-semibold text-[#2B2D42]">{title}</span>」の記録を削除します。<br />この操作は取り消せません。
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full min-h-[44px] bg-[#FAF7F2] hover:bg-[#F0E6DD] text-[#2B2D42] font-semibold py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full min-h-[44px] bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
};
