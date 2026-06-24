// ============================================================
// MOCK FIXTURES â€” Static seed data
// DÃ¹ng cho MSW handlers trong development
// ============================================================

import type { User, ChatMessage, CompanionReview } from '@/shared/types';

// --- PINTEREST IMAGES ---
export const MOCK_PINTEREST_IMAGES = [
  'https://i.pinimg.com/736x/4e/97/ae/4e97aec9a4a5b042060f478a5893419c.jpg',
  'https://i.pinimg.com/736x/d4/98/da/d498dabc6f61e109499b2b46d9e77bdb.jpg',
  'https://i.pinimg.com/736x/85/17/50/851750b42d8ed0ee05925eeba43cf3c1.jpg',
  'https://i.pinimg.com/736x/fc/59/58/fc595833faedd0288d5c67f7025b6e25.jpg',
  'https://i.pinimg.com/1200x/7d/a7/01/7da701e55f053ee6308b0998af8df927.jpg',
  'https://i.pinimg.com/736x/2a/5e/1a/2a5e1a9595d93214e7fd7de97d1697a0.jpg',
  'https://i.pinimg.com/1200x/d7/82/50/d7825054ba17af3c2b44510ab188ce4a.jpg',
  'https://i.pinimg.com/736x/dc/53/11/dc53111fdf93a00b4b86a635c64fcedd.jpg',
  'https://i.pinimg.com/736x/4b/bf/2a/4bbf2abfeaf34b9a222b2ddc7b131721.jpg',
  'https://i.pinimg.com/736x/cc/54/46/cc5446561f3cf927d87dd13757d01685.jpg',
  'https://i.pinimg.com/736x/5f/d2/c4/5fd2c4743e737da3a16a047ea5b857ba.jpg',
  'https://i.pinimg.com/736x/cd/b0/8e/cdb08e3c67a920541797d982ce34b648.jpg',
];

export function getMockAvatarUrl(id: string): string {
  const numMatch = id.match(/\d+/);
  const index = numMatch ? parseInt(numMatch[0], 10) : 0;
  return MOCK_PINTEREST_IMAGES[index % MOCK_PINTEREST_IMAGES.length];
}

export function getMockAlbumUrls(id: string): string[] {
  const numMatch = id.match(/\d+/);
  const index = numMatch ? parseInt(numMatch[0], 10) : 0;
  const album1 = MOCK_PINTEREST_IMAGES[(index + 1) % MOCK_PINTEREST_IMAGES.length];
  const album2 = MOCK_PINTEREST_IMAGES[(index + 2) % MOCK_PINTEREST_IMAGES.length];
  return [album1, album2];
}

// --- AUTH ---
export const mockUsers = {
  guest: null,
  client: {
    userId: 'u-client-1',
    email: 'minh.khach@example.com',
    displayName: 'Minh KhÃ¡ch',
    avatarUrl: getMockAvatarUrl('u-client-1'),
    role: 'CLIENT' as const,
  },
  companion: {
    userId: 'u-comp-1',
    email: 'linh.companion@example.com',
    displayName: 'Nguyá»…n Thá»‹ Linh',
    avatarUrl: getMockAvatarUrl('u-comp-1'),
    role: 'COMPANION' as const,
  },
  admin: {
    userId: 'u-admin-1',
    email: 'admin@example.com',
    displayName: 'Admin',
    avatarUrl: getMockAvatarUrl('u-admin-1'),
    role: 'ADMIN' as const,
  },
}

export let currentMockUser: User | null = mockUsers.client

/** Äá»c role Ä‘Ã£ lÆ°u tá»« localStorage Ä‘á»ƒ persist qua page reload */
if (typeof window !== 'undefined') {
  const savedRole = localStorage.getItem('msw_mock_role') as keyof typeof mockUsers | null
  if (savedRole && savedRole in mockUsers) {
    currentMockUser = mockUsers[savedRole]
    document.cookie = `msw_mock_role=${savedRole}; path=/; max-age=31536000`
  }
}

export function setMockUser(role: keyof typeof mockUsers) {
  currentMockUser = mockUsers[role]
  if (typeof window !== 'undefined') {
    if (role === 'guest') {
      localStorage.removeItem('msw_mock_role')
      document.cookie = 'msw_mock_role=; path=/; max-age=0; SameSite=Lax'
    } else {
      localStorage.setItem('msw_mock_role', role)
      document.cookie = `msw_mock_role=${role}; path=/; max-age=31536000; SameSite=Lax`
    }
  }
  console.log('[MSW] Switched user role to:', role)
}


// --- COMPANIONS ---
const rawCompanions = [
  {
    companionId: 'comp-1',
    displayName: 'Nguyá»…n Thá»‹ Linh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-1',
    introText: 'MÃ¬nh thÃ­ch cÃ  phÃª, sÃ¡ch vÃ  nhá»¯ng cuá»™c trÃ² chuyá»‡n thÃº vá»‹. HÃ£y cÃ¹ng mÃ¬nh khÃ¡m phÃ¡ SÃ i GÃ²n nhÃ©!',
    availableCities: ['TP.HCM'],
    averageRating: 4.8,
    totalReviews: 23,
    voiceIntroUrl: 'https://www.w3schools.com/html/horse.mp3',
    albumUrls: [
      'https://i.pravatar.cc/600?u=comp-1a',
      'https://i.pravatar.cc/600?u=comp-1b',
    ],
    scenarios: [
      { scenarioId: 'sc-1-1', title: 'CÃ  phÃª & trÃ² chuyá»‡n', description: 'Gáº·p gá»¡ táº¡i quÃ¡n cÃ  phÃª yÃªn tÄ©nh', durationMinutes: 60, price: 150, publicPlace: 'Quáº­n 1, TP.HCM' },
      { scenarioId: 'sc-1-2', title: 'Dáº¡o phá»‘ SÃ i GÃ²n', description: 'KhÃ¡m phÃ¡ cÃ¡c con phá»‘ Ä‘áº¹p cÃ¹ng nhau', durationMinutes: 120, price: 300, publicPlace: 'Báº¿n NhÃ  Rá»“ng, TP.HCM' },
    ],
    recentReviews: [
      { reviewId: 'rv-1', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 5, comment: 'Ráº¥t thÃ¢n thiá»‡n vÃ  vui tÃ­nh! Linh nÃ³i chuyá»‡n ráº¥t cÃ³ duyÃªn, cáº£ buá»•i cÃ  phÃª trÃ´i qua nhanh khÃ´ng ngá». Sáº½ Ä‘áº·t lá»‹ch láº¡i láº§n sau!', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Minh K.', postedAt: '2 ngÃ y trÆ°á»›c' },
      { reviewId: 'rv-2', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 5, comment: 'ÄÃºng giá», lá»‹ch sá»± vÃ  ráº¥t biáº¿t cÃ¡ch táº¡o khÃ´ng khÃ­ thoáº£i mÃ¡i. Háº¹n Linh á»Ÿ quÃ¡n cÃ  phÃª view Ä‘áº¹p, áº£nh check-in cÅ©ng ra xá»‹n láº¯m ðŸ“¸', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Tuáº¥n A.', postedAt: '5 ngÃ y trÆ°á»›c' },
      { reviewId: 'rv-3', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 4, comment: 'KhÃ¡ oke, buá»•i gáº·p gá»¡ nháº¹ nhÃ ng vÃ  thÃº vá»‹. Linh nghe nhiá»u hÆ¡n nÃ³i, Ä‘Ãºng kiá»ƒu mÃ¬nh cáº§n sau tuáº§n lÃ m viá»‡c má»‡t má»i.', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Long H.', postedAt: '1 tuáº§n trÆ°á»›c' },
      { reviewId: 'rv-4', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 5, comment: 'Top!', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Khoa B.', postedAt: '2 tuáº§n trÆ°á»›c' },
      { reviewId: 'rv-5', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 4, comment: 'Linh khÃ¡ dá»… thÆ°Æ¡ng vÃ  hay cÆ°á»i. MÃ¬nh hÆ¡i shy lÃºc Ä‘áº§u nhÆ°ng Linh chá»§ Ä‘á»™ng má»Ÿ chuyá»‡n ráº¥t tá»± nhiÃªn, khÃ´ng gÆ°á»£ng gáº¡o chÃºt nÃ o. Tráº£i nghiá»‡m tá»‘t hÆ¡n mong Ä‘á»£i!', createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'PhÃº N.', postedAt: '3 tuáº§n trÆ°á»›c' },
    ],
    featuredScenario: { title: 'CÃ  phÃª & trÃ² chuyá»‡n', price: 150 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-2',
    displayName: 'Tráº§n HÃ  My',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-2',
    introText: 'Food blogger, yÃªu áº©m thá»±c vÃ  du lá»‹ch. CÃ¹ng mÃ¬nh khÃ¡m phÃ¡ quÃ¡n ngon HÃ  Ná»™i nhÃ©.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.6,
    totalReviews: 11,
    voiceIntroUrl: null,
    albumUrls: ['https://i.pravatar.cc/600?u=comp-2a'],
    scenarios: [
      { scenarioId: 'sc-2-1', title: 'Ä‚n tá»‘i táº¡i nhÃ  hÃ ng', description: 'CÃ¹ng thÆ°á»Ÿng thá»©c bá»¯a tá»‘i ngon', durationMinutes: 90, price: 250, publicPlace: 'HoÃ n Kiáº¿m, HÃ  Ná»™i' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Ä‚n tá»‘i táº¡i nhÃ  hÃ ng', price: 250 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-3',
    displayName: 'Pháº¡m Báº£o ChÃ¢u',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-3',
    introText: 'GiÃ¡o viÃªn yoga, thÃ­ch thiÃªn nhiÃªn vÃ  sá»‘ng cháº­m.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 0,
    totalReviews: 0,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-3-1', title: 'Yoga buá»•i sÃ¡ng', description: 'Buá»•i táº­p yoga nháº¹ nhÃ ng', durationMinutes: 60, price: 200, publicPlace: 'BÃ£i biá»ƒn Má»¹ KhÃª, ÄÃ  Náºµng' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Yoga buá»•i sÃ¡ng', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-4',
    displayName: 'LÃª Thanh Tháº£o',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-4',
    introText: 'Nhiáº¿p áº£nh gia tá»± do, thÃ­ch chá»¥p áº£nh phong cáº£nh vÃ  portrait.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 47,
    voiceIntroUrl: null,
    albumUrls: ['https://i.pravatar.cc/600?u=comp-4a', 'https://i.pravatar.cc/600?u=comp-4b'],
    scenarios: [
      { scenarioId: 'sc-4-1', title: 'Chá»¥p áº£nh ká»· niá»‡m', description: 'Buá»•i chá»¥p áº£nh chuyÃªn nghiá»‡p', durationMinutes: 120, price: 500, publicPlace: 'Quáº­n 3, TP.HCM' },
    ],
    recentReviews: [
      { reviewId: 'rv-4', bookingId: 'bk-3', clientId: 'u-client-1', companionId: 'comp-4', rating: 5, comment: 'áº¢nh Ä‘áº¹p xuáº¥t sáº¯c!', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Nam T.', postedAt: '1 tuáº§n trÆ°á»›c' },
    ],
    featuredScenario: { title: 'Chá»¥p áº£nh ká»· niá»‡m', price: 500 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-5',
    displayName: 'VÃµ Kim NgÃ¢n',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-5',
    introText: 'ThÃ­ch xem phim, Ä‘á»c sÃ¡ch, vÃ  trÃ  sá»¯a. CÃ¹ng mÃ¬nh thÆ° giÃ£n cuá»‘i tuáº§n nhÃ©.',
    availableCities: ['TP.HCM'],
    averageRating: 4.5,
    totalReviews: 8,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-5-1', title: 'Xem phim cÃ¹ng nhau', description: 'Chá»n phim yÃªu thÃ­ch vÃ  cÃ¹ng xem', durationMinutes: 150, price: 200, publicPlace: 'CGV Vincom, TP.HCM' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Xem phim cÃ¹ng nhau', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-6',
    displayName: 'Äinh ThÃºy Vy',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-6',
    introText: 'Sinh viÃªn nÄƒm cuá»‘i, nÄƒng Ä‘á»™ng vÃ  hÃ i hÆ°á»›c.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.2,
    totalReviews: 3,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-6-1', title: 'Du lá»‹ch 1 ngÃ y', description: 'KhÃ¡m phÃ¡ HÃ  Ná»™i cÃ¹ng nhau', durationMinutes: 240, price: 400, publicPlace: 'Há»“ TÃ¢y, HÃ  Ná»™i' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Du lá»‹ch 1 ngÃ y', price: 400 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-7',
    displayName: 'Huá»³nh Anh ThÆ°',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-7',
    introText: 'Äáº§u báº¿p nghiá»‡p dÆ°, thÃ­ch náº¥u Äƒn vÃ  chia sáº» cÃ´ng thá»©c.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.7,
    totalReviews: 15,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-7-1', title: 'Náº¥u Äƒn táº¡i nhÃ ', description: 'CÃ¹ng náº¥u má»™t bá»¯a Äƒn ngon', durationMinutes: 120, price: 350, publicPlace: 'NhÃ  riÃªng, ÄÃ  Náºµng' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Náº¥u Äƒn táº¡i nhÃ ', price: 350 },
    status: 'APPROVED',
  },
  // --- 20 COMPANIONS Bá»” SUNG (comp-8 tá»›i comp-27) ---
  {
    companionId: 'comp-8',
    displayName: 'Nguyá»…n HoÃ ng Yáº¿n',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-8',
    introText: 'ThÃ­ch Ã¢m nháº¡c cá»• Ä‘iá»ƒn vÃ  váº½ tranh. Ráº¥t vui Ä‘Æ°á»£c gáº·p cÃ¡c báº¡n.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.8,
    totalReviews: 9,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-8-1', title: 'Triá»ƒn lÃ£m nghá»‡ thuáº­t', description: 'CÃ¹ng tham quan triá»ƒn lÃ£m tranh', durationMinutes: 90, price: 220, publicPlace: 'TrÃ ng Tiá»n, HÃ  Ná»™i' }],
    recentReviews: [],
    featuredScenario: { title: 'Triá»ƒn lÃ£m nghá»‡ thuáº­t', price: 220 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-9',
    displayName: 'Phan Thá»‹ Ngá»c Diá»‡p',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-9',
    introText: 'ThÃ­ch leo nÃºi, dÃ£ ngoáº¡i vÃ  chá»¥p áº£nh thiÃªn nhiÃªn.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.5,
    totalReviews: 14,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-9-1', title: 'DÃ£ ngoáº¡i SÆ¡n TrÃ ', description: 'KhÃ¡m phÃ¡ bÃ¡n Ä‘áº£o SÆ¡n TrÃ ', durationMinutes: 180, price: 320, publicPlace: 'SÆ¡n TrÃ , ÄÃ  Náºµng' }],
    recentReviews: [],
    featuredScenario: { title: 'DÃ£ ngoáº¡i SÆ¡n TrÃ ', price: 320 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-10',
    displayName: 'LÃ¢m TÃº Quá»³nh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-10',
    introText: 'YÃªu Ä‘á»™ng váº­t, Ä‘áº·c biá»‡t lÃ  mÃ¨o. Ráº¥t thÃ­ch trÃ² chuyá»‡n.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 30,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-10-1', title: 'CÃ  phÃª mÃ¨o', description: 'Äi uá»‘ng nÆ°á»›c táº¡i quÃ¡n cÃ  phÃª mÃ¨o', durationMinutes: 60, price: 160, publicPlace: 'Quáº­n 10, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'CÃ  phÃª mÃ¨o', price: 160 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-11',
    displayName: 'BÃ¹i KhÃ¡nh Vy',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-11',
    introText: 'ThÃ­ch Ä‘á»c sÃ¡ch tÃ¢m lÃ½ há»c vÃ  Ä‘i dáº¡o buá»•i tá»‘i.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.7,
    totalReviews: 12,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-11-1', title: 'Dáº¡o quanh Há»“ GÆ°Æ¡m', description: 'TrÃ² chuyá»‡n vÃ  ngáº¯m cáº£nh phá»‘ Ä‘i bá»™', durationMinutes: 90, price: 180, publicPlace: 'HoÃ n Kiáº¿m, HÃ  Ná»™i' }],
    recentReviews: [],
    featuredScenario: { title: 'Dáº¡o quanh Há»“ GÆ°Æ¡m', price: 180 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-12',
    displayName: 'TrÆ°Æ¡ng Má»¹ Linh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-12',
    introText: 'YÃªu thÃ­ch thá»i trang, shopping vÃ  lÃ m Ä‘áº¹p. CÃ¹ng Ä‘i mua sáº¯m nhÃ©!',
    availableCities: ['TP.HCM'],
    averageRating: 4.6,
    totalReviews: 5,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-12-1', title: 'Shopping & TÆ° váº¥n thá»i trang', description: 'Äi mua sáº¯m táº¡i TTTM', durationMinutes: 120, price: 300, publicPlace: 'Takashimaya, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Shopping & TÆ° váº¥n thá»i trang', price: 300 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-13',
    displayName: 'Äáº·ng Mai PhÆ°Æ¡ng',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-13',
    introText: 'GiÃ¡o viÃªn dáº¡y tiáº¿ng Anh, cá»Ÿi má»Ÿ vÃ  thÃ­ch káº¿t báº¡n má»›i.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.9,
    totalReviews: 22,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-13-1', title: 'Há»c tiáº¿ng Anh giao tiáº¿p', description: 'TrÃ² chuyá»‡n báº±ng tiáº¿ng Anh', durationMinutes: 60, price: 250, publicPlace: 'Háº£i ChÃ¢u, ÄÃ  Náºµng' }],
    recentReviews: [],
    featuredScenario: { title: 'Há»c tiáº¿ng Anh giao tiáº¿p', price: 250 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-14',
    displayName: 'DÆ°Æ¡ng Thu Thá»§y',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-14',
    introText: 'Vui váº», nÄƒng Ä‘á»™ng, thÃ­ch cÃ¡c hoáº¡t Ä‘á»™ng ngoÃ i trá»i.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.4,
    totalReviews: 8,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-14-1', title: 'Äáº¡p xe TÃ¢y Há»“', description: 'Äáº¡p xe quanh há»“ vÃ  trÃ² chuyá»‡n', durationMinutes: 120, price: 200, publicPlace: 'TÃ¢y Há»“, HÃ  Ná»™i' }],
    recentReviews: [],
    featuredScenario: { title: 'Äáº¡p xe TÃ¢y Há»“', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-15',
    displayName: 'NgÃ´ TrÃºc Mai',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-15',
    introText: 'YÃªu thÃ­ch lÃ m bÃ¡nh ngá»t, chá»¥p áº£nh vÃ  cÃ  phÃª.',
    availableCities: ['TP.HCM'],
    averageRating: 4.8,
    totalReviews: 19,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-15-1', title: 'ThÆ°á»Ÿng trÃ  & BÃ¡nh ngá»t', description: 'Gáº·p gá»¡ táº¡i tiá»‡m trÃ  chiá»u', durationMinutes: 90, price: 220, publicPlace: 'Quáº­n 3, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'ThÆ°á»Ÿng trÃ  & BÃ¡nh ngá»t', price: 220 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-16',
    displayName: 'HoÃ ng Tháº£o NguyÃªn',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-16',
    introText: 'ThÃ­ch thÆ¡ ca, nháº¡c nháº¹ vÃ  cuá»™c sá»‘ng bÃ¬nh yÃªn.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.7,
    totalReviews: 7,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-16-1', title: 'Äi dáº¡o ngáº¯m hoÃ ng hÃ´n', description: 'Dáº¡o bá»™ bá» sÃ´ng HÃ n chiá»u muá»™n', durationMinutes: 60, price: 150, publicPlace: 'SÃ´ng HÃ n, ÄÃ  Náºµng' }],
    recentReviews: [],
    featuredScenario: { title: 'Äi dáº¡o ngáº¯m hoÃ ng hÃ´n', price: 150 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-17',
    displayName: 'Äá»— Háº£i ÄÆ°á»ng',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-17',
    introText: 'Nhiá»‡t huyáº¿t, thÃ­ch chia sáº» vá» khá»Ÿi nghiá»‡p vÃ  kinh doanh.',
    availableCities: ['TP.HCM'],
    averageRating: 4.3,
    totalReviews: 4,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-17-1', title: 'CÃ  phÃª Business', description: 'TrÃ² chuyá»‡n trao Ä‘á»•i cÃ´ng viá»‡c', durationMinutes: 90, price: 350, publicPlace: 'Quáº­n 2, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'CÃ  phÃª Business', price: 350 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-18',
    displayName: 'VÅ© Ngá»c TrÃ¢m',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-18',
    introText: 'ThÃ­ch ca hÃ¡t, Ä‘Ã n guitar vÃ  nÃ³i chuyá»‡n hÃ i hÆ°á»›c.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.9,
    totalReviews: 26,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-18-1', title: 'HÃ¡t live acoustic', description: 'CÃ¹ng hÃ¡t giao lÆ°u acoustic', durationMinutes: 90, price: 280, publicPlace: 'Cáº§u Giáº¥y, HÃ  Ná»™i' }],
    recentReviews: [],
    featuredScenario: { title: 'HÃ¡t live acoustic', price: 280 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-19',
    displayName: 'Cao Tuyáº¿t Nhung',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-19',
    introText: 'ThÃ­ch táº­p gym, Äƒn healthy vÃ  chÄƒm sÃ³c sá»©c khá»e.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.6,
    totalReviews: 15,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-19-1', title: 'Táº­p Gym & Fitness', description: 'CÃ¹ng táº­p luyá»‡n nÃ¢ng cao thá»ƒ lá»±c', durationMinutes: 90, price: 200, publicPlace: 'Háº£i ChÃ¢u, ÄÃ  Náºµng' }],
    recentReviews: [],
    featuredScenario: { title: 'Táº­p Gym & Fitness', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-20',
    displayName: 'LÃ½ Kim Chi',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-20',
    introText: 'ThÃ­ch chá»¥p hÃ¬nh retro, Ä‘i cafe vintage vÃ  ngáº¯m phá»‘.',
    availableCities: ['TP.HCM'],
    averageRating: 4.8,
    totalReviews: 11,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-20-1', title: 'Photo Tour Quáº­n 5', description: 'CÃ¹ng Ä‘i chá»¥p hÃ¬nh vintage á»Ÿ Chá»£ Lá»›n', durationMinutes: 120, price: 260, publicPlace: 'Quáº­n 5, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Photo Tour Quáº­n 5', price: 260 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-21',
    displayName: 'Táº¡ Tháº£o TiÃªn',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-21',
    introText: 'Ráº¥t thÃ­ch náº¥u Ä‘á»“ Äƒn HÃ n Quá»‘c vÃ  lÃ m bÃ¡nh.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.7,
    totalReviews: 13,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-21-1', title: 'CÃ¹ng lÃ m bÃ¡nh ngá»t', description: 'Há»c vÃ  lÃ m bÃ¡nh ngá»t cÃ¹ng nhau', durationMinutes: 120, price: 300, publicPlace: 'Ba ÄÃ¬nh, HÃ  Ná»™i' }],
    recentReviews: [],
    featuredScenario: { title: 'CÃ¹ng lÃ m bÃ¡nh ngá»t', price: 300 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-22',
    displayName: 'Kiá»u Minh Trang',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-22',
    introText: 'ThÃ­ch hoa, lÃ m vÆ°á»n vÃ  cáº¯m hoa nghá»‡ thuáº­t.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.5,
    totalReviews: 6,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-22-1', title: 'Workshop cáº¯m hoa', description: 'CÃ¹ng cáº¯m hoa vÃ  thÆ° giÃ£n', durationMinutes: 90, price: 220, publicPlace: 'LiÃªn Chiá»ƒu, ÄÃ  Náºµng' }],
    recentReviews: [],
    featuredScenario: { title: 'Workshop cáº¯m hoa', price: 220 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-23',
    displayName: 'Tráº§n VÃ¢n Anh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-23',
    introText: 'Thiáº¿t káº¿ Ä‘á»“ há»a, thÃ­ch game indie vÃ  anime.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 18,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-23-1', title: 'CÃ  phÃª Console Game', description: 'CÃ¹ng chÆ¡i game vÃ  trÃ² chuyá»‡n', durationMinutes: 120, price: 250, publicPlace: 'Quáº­n 1, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'CÃ  phÃª Console Game', price: 250 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-24',
    displayName: 'Nguyá»…n Ngá»c Diá»‡p',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-24',
    introText: 'YÃªu thÃ­ch trÃ  Ä‘áº¡o, cá» vÃ¢y vÃ  tÃ¬m hiá»ƒu lá»‹ch sá»­.',
    availableCities: ['HÃ  Ná»™i'],
    averageRating: 4.8,
    totalReviews: 14,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-24-1', title: 'TrÃ  Ä‘áº¡o Ä‘Ã m Ä‘áº¡o', description: 'ThÆ°á»Ÿng trÃ  vÃ  trÃ² chuyá»‡n nháº¹ nhÃ ng', durationMinutes: 90, price: 200, publicPlace: 'Äá»‘ng Äa, HÃ  Ná»™i' }],
    recentReviews: [],
    featuredScenario: { title: 'TrÃ  Ä‘áº¡o Ä‘Ã m Ä‘áº¡o', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-25',
    displayName: 'ÄoÃ n Thanh Háº±ng',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-25',
    introText: 'ThÃ­ch táº­p Pilates vÃ  tÃ¬m hiá»ƒu vá» tarot.',
    availableCities: ['ÄÃ  Náºµng'],
    averageRating: 4.6,
    totalReviews: 9,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-25-1', title: 'Tráº£i bÃ i Tarot cÃ  phÃª', description: 'CÃ¹ng xem bÃ i tarot vui váº»', durationMinutes: 60, price: 180, publicPlace: 'NgÅ© HÃ nh SÆ¡n, ÄÃ  Náºµng' }],
    recentReviews: [],
    featuredScenario: { title: 'Tráº£i bÃ i Tarot cÃ  phÃª', price: 180 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-26',
    displayName: 'Há»“ PhÆ°Æ¡ng Tháº£o',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-26',
    introText: 'YÃªu thÃ­ch piano vÃ  giao tiáº¿p Ä‘a vÄƒn hÃ³a.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 21,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-26-1', title: 'ÄÃ n piano & Ngoáº¡i ngá»¯', description: 'TrÃ² chuyá»‡n há»c há»i cÃ¹ng nhau', durationMinutes: 90, price: 280, publicPlace: 'BÃ¬nh Tháº¡nh, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'ÄÃ n piano & Ngoáº¡i ngá»¯', price: 280 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-27',
    displayName: 'Mai Báº£o TrÃ¢n',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-27',
    introText: 'NhÃ¢n viÃªn káº¿ toÃ¡n, tráº§m tÃ­nh nhÆ°ng ráº¥t biáº¿t láº¯ng nghe.',
    availableCities: ['TP.HCM'],
    averageRating: 4.7,
    totalReviews: 10,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-27-1', title: 'Coffee & TrÃºt báº§u tÃ¢m sá»±', description: 'CÃ¹ng uá»‘ng cÃ  phÃª láº¯ng nghe chia sáº»', durationMinutes: 60, price: 150, publicPlace: 'PhÃº Nhuáº­n, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Coffee & TrÃºt báº§u tÃ¢m sá»±', price: 150 },
    status: 'APPROVED',
  },
]

export const companions = rawCompanions.map(c => {
  const minPrice = c.scenarios.length > 0 ? Math.min(...c.scenarios.map(s => s.price)) : 0;
  return {
    ...c,
    avatarUrl: getMockAvatarUrl(c.companionId),
    albumUrls: c.albumUrls && c.albumUrls.length > 0 ? getMockAlbumUrls(c.companionId) : [],
    minPrice,
    recentReviews: c.recentReviews.map(r => ({
      ...r,
      authorAvatarUrl: getMockAvatarUrl(r.clientId || 'rv-1'),
    })) as (CompanionReview & { authorAvatarUrl: string; authorName: string; postedAt: string })[],
  };
});

// --- BOOKINGS ---
const rawBookings = [
  {
    bookingId: 'bk-1',
    clientId: 'u-client-1',
    clientName: 'Minh KhÃ¡ch',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-1',
    companionName: 'Nguyá»…n Thá»‹ Linh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-1',
    scenarioTitle: 'CÃ  phÃª & trÃ² chuyá»‡n',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'ACCEPTED' as const,
    price: 150,
    chatRoomId: 'room-bk-1',
    publicPlace: 'Quáº­n 1, TP.HCM',
    escrowStatus: 'held',
    chatRoomStatus: 'ACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot: {
      title: 'CÃ  phÃª & trÃ² chuyá»‡n',
      price: 150,
      durationMinutes: 60,
      publicPlace: 'Quáº­n 1, TP.HCM'
    }
  },
  {
    bookingId: 'bk-2',
    clientId: 'u-client-1',
    clientName: 'Minh KhÃ¡ch',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-2',
    companionName: 'Tráº§n HÃ  My',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-2',
    scenarioTitle: 'Ä‚n tá»‘i táº¡i nhÃ  hÃ ng',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: 'COMPLETED' as const,
    price: 250,
    chatRoomId: 'room-bk-2',
    publicPlace: 'HoÃ n Kiáº¿m, HÃ  Ná»™i',
    escrowStatus: 'released',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: true,
    scenarioSnapshot: {
      title: 'Ä‚n tá»‘i táº¡i nhÃ  hÃ ng',
      price: 250,
      durationMinutes: 90,
      publicPlace: 'HoÃ n Kiáº¿m, HÃ  Ná»™i'
    }
  },
  {
    bookingId: 'bk-4',
    clientId: 'u-client-1',
    clientName: 'Minh KhÃ¡ch',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-3',
    companionName: 'Pháº¡m Minh Anh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-3',
    scenarioTitle: 'Äi dáº¡o & chá»¥p áº£nh',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: 'COMPLETED' as const,
    price: 200,
    chatRoomId: 'room-bk-4',
    publicPlace: 'Quáº­n 2, TP.HCM',
    escrowStatus: 'released',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot: {
      title: 'Äi dáº¡o & chá»¥p áº£nh',
      price: 200,
      durationMinutes: 90,
      publicPlace: 'Quáº­n 2, TP.HCM'
    }
  },
  {
    bookingId: 'bk-3',
    clientId: 'u-client-1',
    clientName: 'Minh KhÃ¡ch',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-4',
    companionName: 'LÃª Thanh Tháº£o',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-4',
    scenarioTitle: 'Chá»¥p áº£nh ká»· niá»‡m',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    status: 'PENDING' as const,
    price: 500,
    chatRoomId: null,
    publicPlace: 'Quáº­n 3, TP.HCM',
    escrowStatus: 'frozen',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot: {
      title: 'Chá»¥p áº£nh ká»· niá»‡m',
      price: 500,
      durationMinutes: 120,
      publicPlace: 'Quáº­n 3, TP.HCM'
    }
  },
]

export const mockBookings = rawBookings.map(b => ({
  ...b,
  companionAvatarUrl: getMockAvatarUrl(b.companionId),
  clientAvatarUrl: getMockAvatarUrl(b.clientId),
}));

// --- WALLET ---
import type { WalletTransaction } from '@/shared/types'
export const mockWallet = {
  walletId: 'wall_kazuya_001',
  userId: 'u-client-1',
  availableBalance: 1200,
  frozenBalance: 650,
  transactions: [
    { transactionId: 'tx-1', walletId: 'wall_kazuya_001', description: 'Náº¡p tiá»n VNPay', amount: 1000, type: 'CREDIT' as const, status: 'SUCCESS' as const, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { transactionId: 'tx-2', walletId: 'wall_kazuya_001', description: 'Äáº·t lá»‹ch Â· Ä‚n tá»‘i táº¡i nhÃ  hÃ ng', amount: -250, type: 'DEBIT' as const, status: 'SUCCESS' as const, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { transactionId: 'tx-3', walletId: 'wall_kazuya_001', description: 'Äáº·t lá»‹ch Â· CÃ  phÃª & trÃ² chuyá»‡n', amount: -150, type: 'DEBIT' as const, status: 'PENDING' as const, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { transactionId: 'tx-4', walletId: 'wall_kazuya_001', description: 'Äáº·t lá»‹ch Â· Chá»¥p áº£nh ká»· niá»‡m', amount: -500, type: 'DEBIT' as const, status: 'PENDING' as const, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ] as WalletTransaction[],
}


// --- CHAT ---
const rawChatRooms = [
  {
    chatRoomId: 'room-bk-1',
    bookingId: 'bk-1',
    companionName: 'Nguyá»…n Thá»‹ Linh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-1',
    lastMessage: 'Háº¹n gáº·p báº¡n nhÃ©!',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'ACTIVE' as const,
    unreadCount: 2,
  },
  {
    chatRoomId: 'room-bk-2',
    bookingId: 'bk-2',
    companionName: 'Tráº§n HÃ  My',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-2',
    lastMessage: 'Cáº£m Æ¡n báº¡n ráº¥t nhiá»u!',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'INACTIVE' as const,
    unreadCount: 0,
  },
]

export const mockChatRooms = rawChatRooms.map(r => {
  const booking = rawBookings.find(b => b.bookingId === r.bookingId);
  const companionId = booking ? booking.companionId : 'comp-1';
  return {
    ...r,
    companionId,
    companionAvatarUrl: getMockAvatarUrl(companionId),
  };
});

export const mockMessages: Record<string, ChatMessage[]> = {
  'room-bk-1': [
    { messageId: 'msg-1', roomId: 'room-bk-1', senderId: 'u-comp-1', content: 'Xin chÃ o! MÃ¬nh ráº¥t vui Ä‘Æ°á»£c gáº·p báº¡n ðŸ˜Š', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { messageId: 'msg-2', roomId: 'room-bk-1', senderId: 'u-client-1', content: 'ChÃ o Linh! MÃ¬nh cÅ©ng váº­y. Háº¹n gáº·p báº¡n ngÃ y mai nhÃ©', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { messageId: 'msg-3', roomId: 'room-bk-1', senderId: 'u-comp-1', content: 'Háº¹n gáº·p báº¡n nhÃ©!', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ],
  'room-bk-2': [
    { messageId: 'msg-4', roomId: 'room-bk-2', senderId: 'u-client-1', content: 'Buá»•i tá»‘i ráº¥t vui, cáº£m Æ¡n HÃ  My nhÃ©', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString() },
    { messageId: 'msg-5', roomId: 'room-bk-2', senderId: 'u-comp-2', content: 'Cáº£m Æ¡n báº¡n ráº¥t nhiá»u!', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString() },
  ],
}

// --- NOTIFICATIONS ---
export const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Booking Ä‘Æ°á»£c xÃ¡c nháº­n!',
    body: 'Linh Ä‘Ã£ xÃ¡c nháº­n lá»‹ch háº¹n CÃ  phÃª & trÃ² chuyá»‡n cá»§a báº¡n.',
    type: 'BOOKING_ACCEPTED' as const,
    category: 'TRANSACTIONAL' as const,
    isRead: false,
    actionUrl: '/bookings/bk-1',
    bookingId: 'bk-1',
    senderName: 'Nguyá»…n Thá»‹ Linh',
    senderAvatar: getMockAvatarUrl('comp-1'),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Náº¡p tiá»n thÃ nh cÃ´ng',
    body: 'Báº¡n Ä‘Ã£ náº¡p thÃ nh cÃ´ng 1000 Kano-Coin vÃ o vÃ­.',
    type: 'PAYMENT_SUCCESS' as const,
    category: 'TRANSACTIONAL' as const,
    isRead: true,
    actionUrl: '/wallet',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    title: 'MÃ£ xÃ¡c thá»±c OTP',
    body: 'MÃ£ OTP Ä‘á»ƒ hoÃ n táº¥t giao dá»‹ch Ä‘áº·t lá»‹ch lÃ  582194. CÃ³ hiá»‡u lá»±c trong 5 phÃºt.',
    type: 'OTP_CODE' as const,
    category: 'TRANSACTIONAL' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-4',
    title: 'Tin nháº¯n má»›i tá»« Linh',
    body: 'Háº¹n gáº·p báº¡n ngÃ y mai nhÃ©! MÃ¬nh sáº½ Ä‘áº¿n Ä‘Ãºng giá».',
    type: 'CHAT_MESSAGE' as const,
    category: 'INTERACTION' as const,
    isRead: false,
    actionUrl: '/chat',
    bookingId: 'bk-1',
    senderName: 'Nguyá»…n Thá»‹ Linh',
    senderAvatar: getMockAvatarUrl('comp-1'),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-5',
    title: 'Voucher chÃ o má»«ng thÃ nh viÃªn má»›i ðŸŒ¸',
    body: 'Kanojo gá»­i táº·ng báº¡n mÃ£ giáº£m giÃ¡ 15% (KANOJONEW) Ã¡p dá»¥ng cho láº§n háº¹n hÃ² Ä‘áº§u tiÃªn.',
    type: 'PROMOTION_VOUCHER' as const,
    category: 'PROMOTIONAL' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-6',
    title: 'Nháº¯c nhá»Ÿ: Cáº­p nháº­t Profile',
    body: 'HÃ£y cáº­p nháº­t hÃ¬nh áº£nh Ä‘áº¡i diá»‡n vÃ  pháº§n mÃ´ táº£ cÃ¡ nhÃ¢n Ä‘á»ƒ thu hÃºt nhiá»u báº¡n gÃ¡i hÆ¡n nhÃ©!',
    type: 'PROFILE_REMINDER' as const,
    category: 'PROMOTIONAL' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-7',
    title: 'Há»‡ thá»‘ng chuáº©n bá»‹ báº£o trÃ¬ Ä‘á»‹nh ká»³',
    body: 'Kanojo sáº½ tiáº¿n hÃ nh báº£o trÃ¬ há»‡ thá»‘ng nÃ¢ng cáº¥p Ä‘á»‹nh ká»³ tá»« 02:00 Ä‘áº¿n 04:00 ngÃ y mai. Giao dá»‹ch thanh toÃ¡n cÃ³ thá»ƒ bá»‹ giÃ¡n Ä‘oáº¡n.',
    type: 'SYSTEM_MAINTENANCE' as const,
    category: 'PROMOTIONAL' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

