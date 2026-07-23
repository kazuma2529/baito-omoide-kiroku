export type WorkDateType = 'single' | 'continuous' | 'discrete' | 'long_term';

export const INITIAL_TAGS = [
  '接客',
  '軽作業',
  'イベント',
  '飲食',
  '試験監督',
  '販売',
  '事務',
  '配送',
  '教育',
  'その他',
] as const;

export type JobTag = typeof INITIAL_TAGS[number];

export interface JobRecord {
  id: string;
  userId: string;
  title: string;
  workplace?: string;
  workDateType: WorkDateType;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD or null
  selectedDates: string[]; // Array of YYYY-MM-DD
  isCurrentlyWorking: boolean;
  tags: string[];
  jobDescription?: string;
  impression?: string;
  recommendationRating: number | null; // 1-5
  enjoymentRating: number | null; // 1-5
  busynessRating: number | null; // 1-5
  workabilityRating: number | null; // 1-5
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

export type TabType = 'home' | 'timeline' | 'calendar' | 'mypage';

export interface RatingCategory {
  key: 'recommendationRating' | 'enjoymentRating' | 'busynessRating' | 'workabilityRating';
  label: string;
  description: string;
}

export const RATING_CATEGORIES: RatingCategory[] = [
  { key: 'recommendationRating', label: 'おすすめ度', description: '高評価ほどおすすめ' },
  { key: 'enjoymentRating', label: '楽しさ', description: '高評価ほど楽しかった' },
  { key: 'busynessRating', label: '忙しさ', description: '高評価ほど忙しかった' },
  { key: 'workabilityRating', label: '働きやすさ', description: '高評価ほど働きやすかった' },
];
