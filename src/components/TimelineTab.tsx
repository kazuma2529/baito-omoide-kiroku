import React, { useState } from 'react';
import { JobRecord, INITIAL_TAGS } from '../types';
import { Calendar, Tag as TagIcon, Filter, ChevronRight, BookOpen } from 'lucide-react';

interface TimelineTabProps {
  records: JobRecord[];
  onOpenRecord: (record: JobRecord) => void;
  onOpenNewForm: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  records,
  onOpenRecord,
  onOpenNewForm,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract unique years from records
  const availableYears: string[] = Array.from<string>(
    new Set(
      records
        .map((r) => (r.startDate ? r.startDate.substring(0, 4) : ''))
        .filter((y) => y.length === 4)
    )
  ).sort((a: string, b: string) => b.localeCompare(a));

  // Filter logic
  const filteredRecords = records.filter((r) => {
    const recordYear = r.startDate ? r.startDate.substring(0, 4) : '';
    const matchYear = selectedYear === 'all' || recordYear === selectedYear;
    const matchTag = selectedTag === 'all' || (r.tags && r.tags.includes(selectedTag));
    return matchYear && matchTag;
  });

  const formatDateDisplay = (rec: JobRecord) => {
    if (rec.workDateType === 'single') return rec.startDate;
    if (rec.isCurrentlyWorking) return `${rec.startDate} 〜 勤務中`;
    return `${rec.startDate} 〜 ${rec.endDate || ''}`;
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Filters Section (年 & タグ) */}
      <div className="bg-white border border-[#ece9e0] rounded-3xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2d3436]">
          <Filter className="w-4 h-4 text-[#ff8e88]" />
          <span>絞り込み</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Year Filter Select */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              年で絞り込み
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#fdfbf7] border border-[#ece9e0] rounded-xl px-3 py-2 text-xs text-[#2d3436] font-semibold focus:outline-none focus:border-[#ff8e88]"
            >
              <option value="all">すべての年</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter Select */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              タグで絞り込み
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-[#fdfbf7] border border-[#ece9e0] rounded-xl px-3 py-2 text-xs text-[#2d3436] font-semibold focus:outline-none focus:border-[#ff8e88]"
            >
              <option value="all">すべてのタグ</option>
              {INITIAL_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips Reset */}
        {(selectedYear !== 'all' || selectedTag !== 'all') && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-gray-500">
              {filteredRecords.length}件のレコードを表示中
            </span>
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedTag('all');
              }}
              className="text-[#ff8e88] hover:underline font-semibold cursor-pointer"
            >
              絞り込みを解除
            </button>
          </div>
        )}
      </div>

      {/* Timeline List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-[#ece9e0] rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-[#fdfbf7] text-gray-400 rounded-full flex items-center justify-center mx-auto border border-[#ece9e0]">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[#2d3436]">
            条件に一致するバイト記録がありません。
          </p>
          {(selectedYear !== 'all' || selectedTag !== 'all') && (
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedTag('all');
              }}
              className="text-xs text-[#ff8e88] font-bold hover:underline"
            >
              条件をリセットする
            </button>
          )}
        </div>
      ) : (
        <div className="relative pl-4 space-y-4 border-l-2 border-[#ff8e88]/30 ml-2">
          {filteredRecords.map((rec) => (
            <div key={rec.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[21px] top-4 w-3.5 h-3.5 bg-[#ff8e88] border-2 border-[#fdfbf7] rounded-full shadow-2xs" />

              {/* Card */}
              <div
                onClick={() => onOpenRecord(rec)}
                className="bg-white border border-[#ece9e0] hover:border-[#ff8e88] rounded-2xl p-4 shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Thumbnail 1枚 */}
                  {rec.photoUrls && rec.photoUrls.length > 0 ? (
                    <img
                      src={rec.photoUrls[0]}
                      alt={rec.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#ece9e0]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#fdfbf7] text-[#5fb194] flex items-center justify-center shrink-0 border border-[#ece9e0]">
                      <TagIcon className="w-6 h-6 stroke-[1.75]" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-[#2d3436] truncate group-hover:text-[#ff8e88] transition-colors">
                        {rec.title}
                      </h3>
                      {rec.isCurrentlyWorking && (
                        <span className="text-[10px] font-bold bg-[#5fb194] text-white px-2 py-0.5 rounded-md shrink-0">
                          勤務中
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{formatDateDisplay(rec)}</span>
                    </div>

                    {rec.tags && rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {rec.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-[#f9e2d2] text-[#ff8e88] font-bold px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#ff8e88] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

