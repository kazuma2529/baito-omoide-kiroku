import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { WorkDateType } from '../types';

interface DatePickerCalendarProps {
  mode: WorkDateType;
  startDate: string;
  endDate: string | null;
  selectedDates: string[];
  isCurrentlyWorking: boolean;
  onChange: (data: {
    startDate: string;
    endDate: string | null;
    selectedDates: string[];
    isCurrentlyWorking: boolean;
  }) => void;
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  mode,
  startDate,
  endDate,
  selectedDates,
  isCurrentlyWorking,
  onChange,
}) => {
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Format YYYY-MM-DD
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

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);

    if (mode === 'single') {
      onChange({
        startDate: dateStr,
        endDate: null,
        selectedDates: [dateStr],
        isCurrentlyWorking: false,
      });
    } else if (mode === 'continuous' || mode === 'long_term') {
      if (isCurrentlyWorking) {
        onChange({
          startDate: dateStr,
          endDate: null,
          selectedDates: [dateStr],
          isCurrentlyWorking: true,
        });
        return;
      }

      if (!startDate || (startDate && endDate)) {
        // Start fresh range
        onChange({
          startDate: dateStr,
          endDate: null,
          selectedDates: [dateStr],
          isCurrentlyWorking,
        });
      } else {
        // We have start date, setting end date
        if (dateStr < startDate) {
          onChange({
            startDate: dateStr,
            endDate: startDate,
            selectedDates: [dateStr, startDate],
            isCurrentlyWorking,
          });
        } else {
          onChange({
            startDate,
            endDate: dateStr,
            selectedDates: [startDate, dateStr],
            isCurrentlyWorking,
          });
        }
      }
    } else if (mode === 'discrete') {
      const exists = selectedDates.includes(dateStr);
      let updated: string[];
      if (exists) {
        updated = selectedDates.filter((d) => d !== dateStr);
      } else {
        updated = [...selectedDates, dateStr].sort();
      }
      const newStart = updated.length > 0 ? updated[0] : dateStr;
      onChange({
        startDate: newStart,
        endDate: null,
        selectedDates: updated,
        isCurrentlyWorking: false,
      });
    }
  };

  const isSelected = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);

    if (mode === 'single') {
      return startDate === dateStr;
    } else if (mode === 'discrete') {
      return selectedDates.includes(dateStr);
    } else if (mode === 'continuous' || mode === 'long_term') {
      if (startDate === dateStr || endDate === dateStr) return true;
      if (startDate && endDate && dateStr > startDate && dateStr < endDate) {
        return true;
      }
      return false;
    }
    return false;
  };

  const isRangeEndpoint = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    return dateStr === startDate || dateStr === endDate;
  };

  const weekHeaders = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white border border-[#EADBCE] rounded-2xl p-4 shadow-xs">
      {/* Currently Working Toggle for Long Term */}
      {mode === 'long_term' && (
        <div className="mb-4 pb-3 border-b border-[#F0E6DD]">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrentlyWorking}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                  startDate: startDate || formatDateString(currentYear, currentMonth, 1),
                  endDate: checked ? null : endDate,
                  selectedDates: checked ? [startDate] : selectedDates,
                  isCurrentlyWorking: checked,
                });
              }}
              className="w-5 h-5 accent-[#E07A5F] rounded-md cursor-pointer"
            />
            <span className="text-sm font-medium text-[#2B2D42]">
              現在も勤務中（終了日は不要です）
            </span>
          </label>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-[#6C757D] hover:bg-[#FAF7F2] active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-base font-bold text-[#2B2D42]">
          {currentYear}年 {currentMonth + 1}月
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-[#6C757D] hover:bg-[#FAF7F2] active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              idx === 0 ? 'text-[#E07A5F]' : idx === 6 ? 'text-[#6D9DC5]' : 'text-[#6C757D]'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {paddingArray.map((p) => (
          <div key={`pad-${p}`} className="h-10" />
        ))}

        {daysArray.map((day) => {
          const dateStr = formatDateString(currentYear, currentMonth, day);
          const selected = isSelected(day);
          const isEndpoint = isRangeEndpoint(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`h-10 w-full rounded-xl text-sm font-medium transition-all flex items-center justify-center relative min-h-[40px] ${
                selected
                  ? isEndpoint || mode === 'single' || mode === 'discrete'
                    ? 'bg-[#E07A5F] text-white shadow-xs font-bold scale-105'
                    : 'bg-[#E07A5F]/20 text-[#2B2D42]'
                  : 'hover:bg-[#FAF7F2] text-[#2B2D42]'
              }`}
            >
              {day}
              {mode === 'discrete' && selected && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Summary Helper Label */}
      <div className="mt-3 pt-3 border-t border-[#F0E6DD] text-xs text-[#6C757D]">
        {mode === 'single' && (
          <p>選択日: <span className="font-semibold text-[#2B2D42]">{startDate || '未選択'}</span></p>
        )}
        {(mode === 'continuous' || mode === 'long_term') && (
          <p>
            期間: <span className="font-semibold text-[#2B2D42]">{startDate || '未選択'}</span>
            {isCurrentlyWorking ? (
              <span className="text-[#81B29A] font-bold ml-1">〜 現在も勤務中</span>
            ) : (
              <span> 〜 <span className="font-semibold text-[#2B2D42]">{endDate || 'タップして終了日を選択'}</span></span>
            )}
          </p>
        )}
        {mode === 'discrete' && (
          <p>
            選択中の日数: <span className="font-bold text-[#E07A5F]">{selectedDates.length}日</span>
            {selectedDates.length > 0 && ` (${selectedDates.slice(0, 3).join(', ')}${selectedDates.length > 3 ? '...' : ''})`}
          </p>
        )}
      </div>
    </div>
  );
};
