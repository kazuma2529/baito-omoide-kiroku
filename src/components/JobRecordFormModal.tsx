import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Calendar, AlertCircle, Sparkles, Building2, Check } from 'lucide-react';
import { JobRecord, WorkDateType, INITIAL_TAGS, RATING_CATEGORIES } from '../types';
import { DatePickerCalendar } from './DatePickerCalendar';
import { convertFileToBase64, MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_PHOTO_MB } from '../lib/storageService';

interface JobRecordFormModalProps {
  isOpen: boolean;
  editingRecord?: JobRecord | null;
  initialDate?: string | null;
  onClose: () => void;
  onSave: (recordData: Partial<JobRecord> & { title: string; workDateType: WorkDateType; startDate: string; tags: string[] }) => Promise<void>;
}

export const JobRecordFormModal: React.FC<JobRecordFormModalProps> = ({
  isOpen,
  editingRecord,
  initialDate,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // State management
  const [title, setTitle] = useState('');
  const [workDateType, setWorkDateType] = useState<WorkDateType>('single');
  const [startDate, setStartDate] = useState(initialDate || todayStr);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([initialDate || todayStr]);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [workplace, setWorkplace] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [impression, setImpression] = useState('');

  // Ratings 1-5 or null
  const [recommendationRating, setRecommendationRating] = useState<number | null>(null);
  const [enjoymentRating, setEnjoymentRating] = useState<number | null>(null);
  const [busynessRating, setBusynessRating] = useState<number | null>(null);
  const [workabilityRating, setWorkabilityRating] = useState<number | null>(null);

  // Photos (preview data URLs or remote URLs; data URLs upload to Storage on save)
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Validation & UI State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load editing record data if present
  useEffect(() => {
    if (editingRecord) {
      setTitle(editingRecord.title || '');
      setWorkDateType(editingRecord.workDateType || 'single');
      setStartDate(editingRecord.startDate || todayStr);
      setEndDate(editingRecord.endDate || null);
      setSelectedDates(editingRecord.selectedDates || [editingRecord.startDate || todayStr]);
      setIsCurrentlyWorking(Boolean(editingRecord.isCurrentlyWorking));
      setTags(editingRecord.tags || []);
      setWorkplace(editingRecord.workplace || '');
      setJobDescription(editingRecord.jobDescription || '');
      setImpression(editingRecord.impression || '');
      setRecommendationRating(editingRecord.recommendationRating ?? null);
      setEnjoymentRating(editingRecord.enjoymentRating ?? null);
      setBusynessRating(editingRecord.busynessRating ?? null);
      setWorkabilityRating(editingRecord.workabilityRating ?? null);
      setPhotoUrls(editingRecord.photoUrls || []);
      setIsDirty(false);
    } else {
      // Reset form
      const start = initialDate || todayStr;
      setTitle('');
      setWorkDateType('single');
      setStartDate(start);
      setEndDate(null);
      setSelectedDates([start]);
      setIsCurrentlyWorking(false);
      setTags([]);
      setWorkplace('');
      setJobDescription('');
      setImpression('');
      setRecommendationRating(null);
      setEnjoymentRating(null);
      setBusynessRating(null);
      setWorkabilityRating(null);
      setPhotoUrls([]);
      setIsDirty(false);
    }
    setErrors({});
  }, [editingRecord, initialDate, isOpen]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handleTagToggle = (tag: string) => {
    markDirty();
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    if (errors.tags) {
      setErrors((prev) => ({ ...prev, tags: '' }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    markDirty();

    const remainingSlots = MAX_PHOTOS - photoUrls.length;
    if (remainingSlots <= 0) {
      setErrors((prev) => ({ ...prev, photos: `写真は最大${MAX_PHOTOS}枚までです。` }));
      e.target.value = '';
      return;
    }

    const selected = Array.from(e.target.files as FileList).slice(0, remainingSlots) as File[];
    const oversized = selected.filter((f) => f.size > MAX_PHOTO_BYTES);
    if (oversized.length > 0) {
      setErrors((prev) => ({
        ...prev,
        photos: `写真は1枚あたり${MAX_PHOTO_MB}MB以下にしてください。`,
      }));
      e.target.value = '';
      return;
    }

    setIsUploadingPhotos(true);
    try {
      const base64List = await Promise.all(selected.map((f: File) => convertFileToBase64(f)));
      setPhotoUrls((prev) => [...prev, ...base64List].slice(0, MAX_PHOTOS));
      setErrors((prev) => ({ ...prev, photos: '' }));
      if (e.target.files.length > remainingSlots) {
        setErrors((prev) => ({
          ...prev,
          photos: `写真は最大${MAX_PHOTOS}枚までです。超えた分は追加していません。`,
        }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, photos: '写真を読み込めませんでした。' }));
    } finally {
      setIsUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    markDirty();
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) {
      errs.title = 'バイト名を入力してください。';
    }
    if (!startDate) {
      errs.startDate = '勤務日を選択してください。';
    }
    if (tags.length === 0) {
      errs.tags = '少なくとも1つのタグを選択してください。';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSaving) return;

    setIsSaving(true);
    try {
      await onSave({
        id: editingRecord?.id,
        title: title.trim(),
        workplace: workplace.trim(),
        workDateType,
        startDate,
        endDate: isCurrentlyWorking ? null : endDate,
        selectedDates,
        isCurrentlyWorking,
        tags,
        jobDescription: jobDescription.trim(),
        impression: impression.trim(),
        recommendationRating,
        enjoymentRating,
        busynessRating,
        workabilityRating,
        photoUrls,
        createdAt: editingRecord?.createdAt,
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      setIsSaving(false);
      const message = err instanceof Error ? err.message : '';
      if (message.includes('MB') || message.includes('写真')) {
        setErrors({ form: message, photos: message });
      } else {
        setErrors({ form: '保存できませんでした。通信環境を確認して、もう一度お試しください。' });
      }
    }
  };

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const getRatingState = (key: string) => {
    switch (key) {
      case 'recommendationRating':
        return { val: recommendationRating, set: setRecommendationRating };
      case 'enjoymentRating':
        return { val: enjoymentRating, set: setEnjoymentRating };
      case 'busynessRating':
        return { val: busynessRating, set: setBusynessRating };
      case 'workabilityRating':
        return { val: workabilityRating, set: setWorkabilityRating };
      default:
        return { val: null, set: () => {} };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#fdfbf7] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#ece9e0]">
        {/* Modal Header */}
        <div className="bg-white px-5 py-4 border-b border-[#ece9e0] flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-base font-bold font-serif-accent text-[#2d3436]">
            {editingRecord ? 'バイト記録の編集' : '新しいバイト記録を登録'}
          </h2>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-2 text-gray-400 hover:bg-[#fdfbf7] rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6 overflow-y-auto">
          {errors.form && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* 1. バイト名 (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2d3436]">
              1. バイト名 <span className="text-xs text-[#ff8e88] font-semibold">（必須）</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="例：カフェ ホールスタッフ、夏フェス設営"
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-[#2d3436] focus:outline-none focus:ring-2 transition-all ${
                errors.title ? 'border-red-400 focus:ring-red-200' : 'border-[#ece9e0] focus:border-[#ff8e88] focus:ring-[#ff8e88]/20'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* 2. 勤務日の選択 (Required) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#2d3436]">
              2. 勤務日の選択 <span className="text-xs text-[#ff8e88] font-semibold">（必須）</span>
            </label>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white border border-[#ece9e0] rounded-2xl">
              {(
                [
                  { id: 'single', label: '1日のみ' },
                  { id: 'continuous', label: '連続した複数日' },
                  { id: 'discrete', label: '複数の離れた日' },
                  { id: 'long_term', label: '長期間' },
                ] as const
              ).map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setWorkDateType(type.id);
                    markDirty();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                    workDateType === type.id
                      ? 'bg-[#ff8e88] text-white shadow-2xs'
                      : 'text-gray-400 hover:text-[#2d3436]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Interactive Calendar Component */}
            <DatePickerCalendar
              mode={workDateType}
              startDate={startDate}
              endDate={endDate}
              selectedDates={selectedDates}
              isCurrentlyWorking={isCurrentlyWorking}
              onChange={(data) => {
                setStartDate(data.startDate);
                setEndDate(data.endDate);
                setSelectedDates(data.selectedDates);
                setIsCurrentlyWorking(data.isCurrentlyWorking);
                markDirty();
                if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
              }}
            />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.startDate}</p>
            )}
          </div>

          {/* 3. バイトの種類タグ (Required, Chips) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2d3436]">
              3. バイトの種類タグ <span className="text-xs text-[#ff8e88] font-semibold">（必須・複数選択可）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INITIAL_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 min-h-[38px] ${
                      isSelected
                        ? 'bg-[#5fb194] text-white shadow-2xs scale-102'
                        : 'bg-white text-[#2d3436] border border-[#ece9e0] hover:border-[#5fb194]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
            {errors.tags && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.tags}</p>
            )}
          </div>

          {/* 4. 勤務先名 (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2d3436]">
              4. 勤務先名 <span className="text-xs text-gray-400 font-normal">（任意）</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={workplace}
                onChange={(e) => {
                  setWorkplace(e.target.value);
                  markDirty();
                }}
                placeholder="例：スターライトカフェ 渋谷店"
                className="w-full bg-white border border-[#ece9e0] rounded-2xl px-4 py-3 text-sm text-[#2d3436] focus:outline-none focus:border-[#ff8e88] focus:ring-2 focus:ring-[#ff8e88]/20 transition-all"
              />
            </div>
          </div>

          {/* 5. 仕事の内容 (Optional, Multiline) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2d3436]">
              5. 仕事の内容 <span className="text-xs text-gray-400 font-normal">（任意）</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                markDirty();
              }}
              rows={3}
              placeholder="具体的にどんな仕事を行ったか入力"
              className="w-full bg-white border border-[#ece9e0] rounded-2xl p-3.5 text-sm text-[#2d3436] focus:outline-none focus:border-[#ff8e88] focus:ring-2 focus:ring-[#ff8e88]/20 transition-all resize-none"
            />
          </div>

          {/* 6. 感想 (Optional, Multiline) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2d3436]">
              6. 感想 <span className="text-xs text-gray-400 font-normal">（任意）</span>
            </label>
            <textarea
              value={impression}
              onChange={(e) => {
                setImpression(e.target.value);
                markDirty();
              }}
              rows={3}
              placeholder="楽しかったこと、学び、思い出など"
              className="w-full bg-white border border-[#ece9e0] rounded-2xl p-3.5 text-sm font-serif-accent text-[#2d3436] focus:outline-none focus:border-[#ff8e88] focus:ring-2 focus:ring-[#ff8e88]/20 transition-all resize-none"
            />
          </div>

          {/* 7. 4項目の5段階評価 (Optional, Horizontal Sliders) */}
          <div className="bg-white rounded-2xl p-4 border border-[#ece9e0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ece9e0] pb-2">
              <label className="text-xs font-bold text-[#2d3436] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#ff8e88]" />
                <span>7. 気分・満足度の記録 (1〜5)</span>
              </label>
              <span className="text-xs text-gray-400">任意</span>
            </div>

            {RATING_CATEGORIES.map((cat) => {
              const { val, set } = getRatingState(cat.key);
              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2d3436]">{cat.label}</span>
                    <span className="font-bold text-[#ff8e88]">
                      {val !== null ? `${val} / 5` : <span className="text-gray-400 font-normal">未評価</span>}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={val ?? 3}
                      onChange={(e) => {
                        set(parseInt(e.target.value, 10));
                        markDirty();
                      }}
                      className="w-full h-2 bg-[#f5f2ed] rounded-lg appearance-none cursor-pointer accent-[#ff8e88]"
                    />
                    {val !== null ? (
                      <button
                        type="button"
                        onClick={() => {
                          set(null);
                          markDirty();
                        }}
                        className="text-[11px] text-gray-400 hover:text-[#ff8e88] underline whitespace-nowrap cursor-pointer"
                      >
                        クリア
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          set(3);
                          markDirty();
                        }}
                        className="text-[11px] text-[#ff8e88] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        評価する
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 8. 写真登録 (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2d3436]">
              8. 写真 <span className="text-xs text-gray-400 font-normal">（任意・最大{MAX_PHOTOS}枚）</span>
            </label>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[#ece9e0] group">
                    <img src={url} alt={`プレビュー ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoUrls.length < MAX_PHOTOS && (
              <label className="w-full border-2 border-dashed border-[#ece9e0] hover:border-[#ff8e88] rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 bg-white hover:bg-[#fdfbf7] transition-all cursor-pointer min-h-[80px]">
                <Upload className="w-5 h-5 text-[#ff8e88]" />
                <span className="text-xs font-medium text-[#2d3436]">
                  {isUploadingPhotos ? '読み込み中...' : '写真を選択・追加'}
                </span>
                <span className="text-[10px] text-gray-400">
                  最大{MAX_PHOTOS}枚・1枚あたり{MAX_PHOTO_MB}MB以下
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhotos || isSaving}
                  className="hidden"
                />
              </label>
            )}
            {errors.photos && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.photos}</p>
            )}
          </div>

          {/* 9. 保存ボタン (Bottom) */}
          <div className="pt-3 sticky bottom-0 bg-[#fdfbf7] border-t border-[#ece9e0]">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full min-h-[48px] bg-[#ff8e88] hover:bg-[#e87d77] text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 text-base font-serif-accent"
            >
              {isSaving ? '保存中...' : '記録を保存する'}
            </button>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Close Confirmation */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 text-center shadow-xl">
            <h3 className="text-base font-bold text-[#2B2D42] mb-2">変更を破棄しますか？</h3>
            <p className="text-xs text-[#6C757D] mb-4">入力途中の内容は保存されません。</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="py-2 text-xs font-semibold bg-[#FAF7F2] text-[#2B2D42] rounded-xl"
              >
                編集を続ける
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                className="py-2 text-xs font-semibold bg-red-500 text-white rounded-xl"
              >
                破棄する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
