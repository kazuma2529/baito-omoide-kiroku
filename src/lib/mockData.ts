import { JobRecord } from '../types';

export const INITIAL_MOCK_RECORDS: JobRecord[] = [
  {
    id: 'mock-rec-1',
    userId: 'demo-user-id',
    title: 'カフェ ホール＆キッチンスタッフ',
    workplace: 'スターライトカフェ 渋谷店',
    workDateType: 'long_term',
    startDate: '2025-04-01',
    endDate: null,
    selectedDates: [],
    isCurrentlyWorking: true,
    tags: ['接客', '飲食'],
    jobDescription: '注文取り、エスプレッソ抽出、季節限定ドリンクの作成、レジ対応や閉店後のクローズ作業を担当。',
    impression: '常連のお客さんと仲良くなれて楽しかった！ラテアートが上手に描けるようになったのが一番の思い出。チームの雰囲気もとても温かい。',
    recommendationRating: 5,
    enjoymentRating: 5,
    busynessRating: 4,
    workabilityRating: 5,
    photoUrls: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z'
  },
  {
    id: 'mock-rec-2',
    userId: 'demo-user-id',
    title: '野外音楽フェス スタッフ',
    workplace: '幕張海浜公園 特設会場',
    workDateType: 'continuous',
    startDate: '2025-08-10',
    endDate: '2025-08-12',
    selectedDates: ['2025-08-10', '2025-08-11', '2025-08-12'],
    isCurrentlyWorking: false,
    tags: ['イベント', '軽作業', '接客'],
    jobDescription: '来場者へのパス配布、グッズ販売の列整理、ステージ間の機材移動補助を担当。',
    impression: '真夏の屋外でかなり体力を使ったけれど、大好きなアーティストの音楽を身近に聴きながら働けて最高の3日間だった！まわりのスタッフ同士の絆も深まった。',
    recommendationRating: 4,
    enjoymentRating: 5,
    busynessRating: 5,
    workabilityRating: 3,
    photoUrls: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2025-08-13T09:00:00Z',
    updatedAt: '2025-08-13T09:00:00Z'
  },
  {
    id: 'mock-rec-3',
    userId: 'demo-user-id',
    title: '大学入学試験 試験監督補佐',
    workplace: '東京第一大学 講堂',
    workDateType: 'discrete',
    startDate: '2026-01-17',
    endDate: null,
    selectedDates: ['2026-01-17', '2026-01-18', '2026-01-24'],
    isCurrentlyWorking: false,
    tags: ['試験監督', '軽作業'],
    jobDescription: '問題用紙・解答用紙の配布と回収、テスト中の静粛保持、時間計測補助。',
    impression: '受験生の緊張感がこちらにも伝わってきて、気を抜けない仕事だった。ミスなく正確に作業を進める緊張感と達成感があった。',
    recommendationRating: 4,
    enjoymentRating: 3,
    busynessRating: 2,
    workabilityRating: 4,
    photoUrls: [],
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-01-25T14:00:00Z'
  }
];
