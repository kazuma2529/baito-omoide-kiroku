import React from 'react';
import { JobRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Plus, BookOpen, Calendar, Tag as TagIcon, ChevronRight } from 'lucide-react';

interface HomeTabProps {
  records: JobRecord[];
  onOpenRecord: (record: JobRecord) => void;
  onOpenNewForm: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ records, onOpenRecord, onOpenNewForm }) => {
  const { user } = useAuth();

  // Calculations for Reflections
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthStr = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // This month's records
  const thisMonthRecords = records.filter((r) => {
    if (!r.startDate) return false;
    return r.startDate.startsWith(currentMonthStr) || (r.selectedDates && r.selectedDates.some(d => d.startsWith(currentMonthStr)));
  });

  // This year's records
  const thisYearRecords = records.filter((r) => {
    if (!r.startDate) return false;
    return r.startDate.startsWith(String(currentYear)) || (r.selectedDates && r.selectedDates.some(d => d.startsWith(String(currentYear))));
  });

  // Count unique job types (tags) this year
  const thisYearTagsSet = new Set<string>();
  const tagCountMap: { [tag: string]: number } = {};

  thisYearRecords.forEach((r) => {
    r.tags?.forEach((tag) => {
      thisYearTagsSet.add(tag);
      tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
    });
  });

  // Find most frequent tag this year
  let topTagThisYear = '';
  let maxTagCount = 0;
  Object.entries(tagCountMap).forEach(([tag, count]) => {
    if (count > maxTagCount) {
      maxTagCount = count;
      topTagThisYear = tag;
    }
  });

  // Recent 3 records
  const recentRecords = [...records].slice(0, 3);

  const formatDateDisplay = (rec: JobRecord) => {
    if (rec.workDateType === 'single') return rec.startDate;
    if (rec.isCurrentlyWorking) return `${rec.startDate} 〜 勤務中`;
    return `${rec.startDate} 〜 ${rec.endDate || ''}`;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Greeting Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#ece9e0] shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff8e88]/10 rounded-bl-full pointer-events-none" />
        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ff8e88] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>マイ スクラップブック</span>
        </div>
        <h2 className="text-xl font-bold font-serif-accent text-[#2d3436]">
          こんにちは、{user?.displayName || 'ゲスト'}さん。
        </h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          これまで積み重ねてきたアルバイトの歴史と、大切な成長の記録です。
        </p>
      </div>

      {/* Reflection Card (これまでの記録 - Organic Stats Grid) */}
      <div className="bg-white border border-[#ece9e0] rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-dashed border-[#ece9e0] pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 italic flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-[#5fb194]" />
            <span>これまでの記録</span>
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">振り返りデータ</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#fdfbf7] border border-[#ece9e0] rounded-2xl p-3">
            <span className="text-2xl font-serif-accent font-bold text-[#2d3436] block">
              {records.length}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">総経験数</span>
          </div>

          <div className="bg-[#fdfbf7] border border-[#ece9e0] rounded-2xl p-3">
            <span className="text-2xl font-serif-accent font-bold text-[#ff8e88] block">
              {thisMonthRecords.length}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">今月のバイト</span>
          </div>

          <div className="bg-[#fdfbf7] border border-[#ece9e0] rounded-2xl p-3">
            <span className="text-2xl font-serif-accent font-bold text-[#5fb194] block">
              {thisYearTagsSet.size}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">今年の職種数</span>
          </div>
        </div>

        {topTagThisYear && (
          <div className="pt-1 text-xs text-gray-600 italic border-t border-dashed border-[#ece9e0]">
            今年は <span className="font-bold underline decoration-[#ff8e88] text-[#2d3436]">「{topTagThisYear}」</span> 系のバイトが最も多かったようです。
          </div>
        )}
      </div>

      {/* Recent Records Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2d3436] font-serif-accent">最近の記録</h3>
          <button
            onClick={onOpenNewForm}
            className="text-xs font-bold text-[#ff8e88] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新規追加</span>
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="bg-white border border-[#ece9e0] rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#fdfbf7] text-[#ff8e88] rounded-full flex items-center justify-center mx-auto border border-[#ece9e0]">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#2d3436]">
              まだバイトの記録がありません。<br />最初のバイトを残してみましょう。
            </p>
            <button
              onClick={onOpenNewForm}
              className="inline-flex items-center space-x-2 bg-[#ff8e88] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:bg-[#f07c76] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>バイト記録を追加する</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onOpenRecord(rec)}
                className="bg-white border border-[#ece9e0] hover:border-[#ff8e88] rounded-2xl p-4 shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Thumbnail photo or Tag icon */}
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
                      <h4 className="text-sm font-bold text-[#2d3436] truncate group-hover:text-[#ff8e88] transition-colors">
                        {rec.title}
                      </h4>
                      {rec.isCurrentlyWorking && (
                        <span className="text-[10px] font-bold bg-[#5fb194] text-white px-2 py-0.5 rounded-md shrink-0">
                          勤務中
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

