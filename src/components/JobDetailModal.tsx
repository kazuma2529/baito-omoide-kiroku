import React, { useState } from 'react';
import { X, Edit3, Trash2, Calendar, MapPin, Tag as TagIcon, Sparkles, Building2 } from 'lucide-react';
import { JobRecord, RATING_CATEGORIES } from '../types';

interface JobDetailModalProps {
  record: JobRecord | null;
  onClose: () => void;
  onEdit: (record: JobRecord) => void;
  onDelete: (recordId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  record,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!record) return null;

  const formatDateDisplay = (rec: JobRecord) => {
    if (rec.workDateType === 'single') {
      return rec.startDate;
    }
    if (rec.workDateType === 'discrete') {
      if (!rec.selectedDates || rec.selectedDates.length === 0) return rec.startDate;
      if (rec.selectedDates.length === 1) return rec.selectedDates[0];
      return `${rec.selectedDates.slice(0, 3).join(', ')}${rec.selectedDates.length > 3 ? ` など計${rec.selectedDates.length}日` : ''}`;
    }
    if (rec.isCurrentlyWorking) {
      return `${rec.startDate} 〜 現在勤務中`;
    }
    return `${rec.startDate} 〜 ${rec.endDate || ''}`;
  };

  const getRatingValue = (key: string): number | null => {
    return (record as any)[key] ?? null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#fdfbf7] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#ece9e0]">
        {/* Modal Header */}
        <div className="bg-white px-5 py-4 border-b border-[#ece9e0] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#ff8e88] bg-[#f9e2d2] px-3 py-1 rounded-full">
              {record.isCurrentlyWorking ? '勤務中' : 'バイト詳細'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(record)}
              className="p-2 text-[#2d3436] hover:bg-[#fdfbf7] rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="編集"
            >
              <Edit3 className="w-5 h-5 text-[#2d3436]" />
            </button>
            <button
              onClick={() => onDelete(record.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="削除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-[#fdfbf7] rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Title & Workplace Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#ece9e0] shadow-2xs">
            <h2 className="text-xl font-bold font-serif-accent text-[#2d3436] mb-2 leading-snug">
              {record.title}
            </h2>

            {record.workplace && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                <Building2 className="w-4 h-4 text-[#5fb194] shrink-0" />
                <span>{record.workplace}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-xs font-semibold text-[#ff8e88] bg-[#f9e2d2]/60 px-3 py-1.5 rounded-xl w-fit">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formatDateDisplay(record)}</span>
            </div>

            {/* Tags */}
            {record.tags && record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#ece9e0]">
                {record.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#f9e2d2] text-[#ff8e88] font-bold px-3 py-1 rounded-full flex items-center space-x-1"
                  >
                    <TagIcon className="w-3 h-3 text-[#ff8e88]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job Description */}
          {record.jobDescription && (
            <div className="bg-white rounded-2xl p-5 border border-[#ece9e0] shadow-2xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 italic">
                仕事の内容
              </h3>
              <p className="text-sm text-[#2d3436] leading-relaxed whitespace-pre-wrap">
                {record.jobDescription}
              </p>
            </div>
          )}

          {/* Impression */}
          {record.impression && (
            <div className="bg-white rounded-2xl p-5 border border-[#ece9e0] shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff8e88]/5 rounded-bl-full pointer-events-none" />
              <h3 className="text-xs font-bold text-[#ff8e88] uppercase tracking-widest mb-2 flex items-center space-x-1 italic">
                <Sparkles className="w-3.5 h-3.5" />
                <span>感想・思い出</span>
              </h3>
              <p className="text-sm font-serif-accent text-[#2d3436] leading-relaxed whitespace-pre-wrap italic bg-[#fdfbf7] p-3 rounded-xl border border-[#ece9e0]">
                「{record.impression}」
              </p>
            </div>
          )}

          {/* Ratings (5-level evaluation) */}
          <div className="bg-white rounded-2xl p-5 border border-[#ece9e0] shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 italic">
              自己評価 (1〜5)
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {RATING_CATEGORIES.map((cat) => {
                const val = getRatingValue(cat.key);
                return (
                  <div key={cat.key} className="flex items-center justify-between text-sm py-1 border-b border-[#fdfbf7] last:border-0">
                    <span className="text-xs font-semibold text-gray-600 w-20">{cat.label}</span>
                    <div className="flex-1 flex items-center space-x-3">
                      {val !== null ? (
                        <>
                          <div className="flex-1 bg-[#f5f2ed] h-2 rounded-full overflow-hidden border border-[#ece9e0] relative">
                            <div
                              className="bg-[#ff8e88] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(val / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#2d3436] w-8 text-right">
                            {val} <span className="text-[10px] text-gray-400 font-normal">/5</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">未評価</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photos Polaroid Style */}
          {record.photoUrls && record.photoUrls.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-[#ece9e0] shadow-2xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 italic">
                写真の記録 ({record.photoUrls.length}枚)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {record.photoUrls.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`bg-white p-2 border border-[#ece9e0] shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer ${
                      idx % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg]'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden rounded-xs">
                      <img
                        src={url}
                        alt={`バイト写真 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="h-6 flex items-center justify-center mt-1">
                      <span className="text-[10px] font-serif-accent text-gray-400">
                        写真 #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Photo Modal */}
      {selectedPhotoIndex !== null && record.photoUrls[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <img
            src={record.photoUrls[selectedPhotoIndex]}
            alt="拡大表示"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

