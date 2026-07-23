import React, { useState } from 'react';
import { JobRecord } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Tag as TagIcon, Plus, ChevronRight as ArrowRight } from 'lucide-react';

interface CalendarTabProps {
  records: JobRecord[];
  onOpenRecord: (record: JobRecord) => void;
  onOpenNewFormWithDate: (dateStr: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  records,
  onOpenRecord,
  onOpenNewFormWithDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Helper to check if record includes target date
  const getRecordsForDate = (dateStr: string) => {
    return records.filter((r) => {
      if (r.workDateType === 'single') {
        return r.startDate === dateStr;
      }
      if (r.workDateType === 'discrete') {
        return r.selectedDates && r.selectedDates.includes(dateStr);
      }
      if (r.workDateType === 'continuous' || r.workDateType === 'long_term') {
        if (!r.startDate) return false;
        if (dateStr < r.startDate) return false;
        if (r.isCurrentlyWorking) return true;
        if (r.endDate && dateStr > r.endDate) return false;
        return true;
      }
      return false;
    });
  };

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const weekHeaders = ['日', '月', '火', '水', '木', '金', '土'];

  // Records on selected date
  const selectedDateRecords = getRecordsForDate(selectedDateStr);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Calendar Card */}
      <div className="bg-white border border-[#ece9e0] rounded-3xl p-4 shadow-2xs">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-gray-500 hover:bg-[#fdfbf7] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-base font-bold font-serif-accent text-[#2d3436]">
            {currentYear}年 {currentMonth + 1}月
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-gray-500 hover:bg-[#fdfbf7] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Header */}
        <div className="grid grid-cols-7 text-center mb-1">
          {weekHeaders.map((w, idx) => (
            <div
              key={w}
              className={`text-xs font-semibold py-1 ${
                idx === 0 ? 'text-[#ff8e88]' : idx === 6 ? 'text-[#5fb194]' : 'text-gray-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {paddingArray.map((p) => (
            <div key={`pad-${p}`} className="h-11" />
          ))}

          {daysArray.map((day) => {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            const dayRecords = getRecordsForDate(dateStr);
            const isSelected = selectedDateStr === dateStr;
            const hasRecords = dayRecords.length > 0;

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-11 w-full rounded-2xl text-xs font-medium transition-all flex flex-col items-center justify-center relative cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-[#ff8e88] text-white font-bold shadow-2xs'
                    : hasRecords
                    ? 'bg-[#ff8e88]/15 text-[#2d3436] font-semibold'
                    : 'hover:bg-[#fdfbf7] text-[#2d3436]'
                }`}
              >
                <span>{day}</span>

                {/* Subtle indicator dots */}
                {hasRecords && (
                  <div className="flex space-x-0.5 mt-0.5">
                    {dayRecords.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#ff8e88]'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Records List */}
      <div className="bg-[#fdfbf7] border border-[#ece9e0] rounded-3xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d3436]">
            <CalendarIcon className="w-4 h-4 text-[#ff8e88]" />
            <span>{selectedDateStr} の記録</span>
          </div>

          <button
            onClick={() => onOpenNewFormWithDate(selectedDateStr)}
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#ff8e88] hover:bg-white/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>この日に追加</span>
          </button>
        </div>

        {selectedDateRecords.length === 0 ? (
          <div className="bg-white border border-[#ece9e0] rounded-2xl p-5 text-center text-xs text-gray-500">
            この日のバイト記録はありません。<br />「＋ この日に追加」から新しい記録を作成できます。
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onOpenRecord(rec)}
                className="bg-white border border-[#ece9e0] hover:border-[#ff8e88] rounded-2xl p-3.5 shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {rec.photoUrls && rec.photoUrls.length > 0 ? (
                    <img
                      src={rec.photoUrls[0]}
                      alt={rec.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#ece9e0]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#fdfbf7] text-[#5fb194] flex items-center justify-center shrink-0 border border-[#ece9e0]">
                      <TagIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-[#2d3436] truncate group-hover:text-[#ff8e88]">
                        {rec.title}
                      </h4>
                      {rec.isCurrentlyWorking && (
                        <span className="text-[9px] font-bold bg-[#5fb194] text-white px-1.5 py-0.5 rounded">
                          勤務中
                        </span>
                      )}
                    </div>
                    {rec.workplace && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {rec.workplace}
                      </p>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#ff8e88] shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

