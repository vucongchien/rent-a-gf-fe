// ============================================================
// MOCK FIXTURES — Static seed data
// Dùng cho MSW handlers trong development
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
    displayName: 'Minh Khách',
    avatarUrl: getMockAvatarUrl('u-client-1'),
    role: 'CLIENT' as const,
  },
  companion: {
    userId: 'u-comp-1',
    email: 'linh.companion@example.com',
    displayName: 'Nguyễn Thị Linh',
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

/** Đọc role đã lưu từ localStorage để persist qua page reload */
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
    displayName: 'Nguyễn Thị Linh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-1',
    biography: 'Mình thích cà phê, sách và những cuộc trò chuyện thú vị. Hãy cùng mình khám phá Sài Gòn nhé!',
    availableCities: ['TP.HCM'],
    averageRating: 4.8,
    totalReviews: 23,
    voiceIntroUrl: 'https://www.w3schools.com/html/horse.mp3',
    albumUrls: [
      'https://i.pravatar.cc/600?u=comp-1a',
      'https://i.pravatar.cc/600?u=comp-1b',
    ],
    scenarios: [
      { scenarioId: 'sc-1-1', title: 'Cà phê & trò chuyện', description: 'Gặp gỡ tại quán cà phê yên tĩnh', durationMinutes: 60, price: 150, publicPlace: 'Quận 1, TP.HCM' },
      { scenarioId: 'sc-1-2', title: 'Dạo phố Sài Gòn', description: 'Khám phá các con phố đẹp cùng nhau', durationMinutes: 120, price: 300, publicPlace: 'Bến Nhà Rồng, TP.HCM' },
    ],
    recentReviews: [
      { reviewId: 'rv-1', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 5, comment: 'Rất thân thiện và vui tính! Linh nói chuyện rất có duyên, cả buổi cà phê trôi qua nhanh không ngờ. Sẽ đặt lịch lại lần sau!', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Minh K.', postedAt: '2 ngày trước' },
      { reviewId: 'rv-2', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 5, comment: 'Đúng giờ, lịch sự và rất biết cách tạo không khí thoải mái. Hẹn Linh ở quán cà phê view đẹp, ảnh check-in cũng ra xịn lắm 📸', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Tuấn A.', postedAt: '5 ngày trước' },
      { reviewId: 'rv-3', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 4, comment: 'Khá oke, buổi gặp gỡ nhẹ nhàng và thú vị. Linh nghe nhiều hơn nói, đúng kiểu mình cần sau tuần làm việc mệt mỏi.', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Long H.', postedAt: '1 tuần trước' },
      { reviewId: 'rv-4', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 5, comment: 'Top!', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Khoa B.', postedAt: '2 tuần trước' },
      { reviewId: 'rv-5', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'comp-1', rating: 4, comment: 'Linh khá dễ thương và hay cười. Mình hơi shy lúc đầu nhưng Linh chủ động mở chuyện rất tự nhiên, không gượng gạo chút nào. Trải nghiệm tốt hơn mong đợi!', createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Phú N.', postedAt: '3 tuần trước' },
    ],
    featuredScenario: { title: 'Cà phê & trò chuyện', price: 150 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-2',
    displayName: 'Trần Hà My',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-2',
    biography: 'Food blogger, yêu ẩm thực và du lịch. Cùng mình khám phá quán ngon Hà Nội nhé.',
    availableCities: ['Hà Nội'],
    averageRating: 4.6,
    totalReviews: 11,
    voiceIntroUrl: null,
    albumUrls: ['https://i.pravatar.cc/600?u=comp-2a'],
    scenarios: [
      { scenarioId: 'sc-2-1', title: 'Ăn tối tại nhà hàng', description: 'Cùng thưởng thức bữa tối ngon', durationMinutes: 90, price: 250, publicPlace: 'Hoàn Kiếm, Hà Nội' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Ăn tối tại nhà hàng', price: 250 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-3',
    displayName: 'Phạm Bảo Châu',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-3',
    biography: 'Giáo viên yoga, thích thiên nhiên và sống chậm.',
    availableCities: ['Đà Nẵng'],
    averageRating: 0,
    totalReviews: 0,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-3-1', title: 'Yoga buổi sáng', description: 'Buổi tập yoga nhẹ nhàng', durationMinutes: 60, price: 200, publicPlace: 'Bãi biển Mỹ Khê, Đà Nẵng' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Yoga buổi sáng', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-4',
    displayName: 'Lê Thanh Thảo',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-4',
    biography: 'Nhiếp ảnh gia tự do, thích chụp ảnh phong cảnh và portrait.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 47,
    voiceIntroUrl: null,
    albumUrls: ['https://i.pravatar.cc/600?u=comp-4a', 'https://i.pravatar.cc/600?u=comp-4b'],
    scenarios: [
      { scenarioId: 'sc-4-1', title: 'Chụp ảnh kỷ niệm', description: 'Buổi chụp ảnh chuyên nghiệp', durationMinutes: 120, price: 500, publicPlace: 'Quận 3, TP.HCM' },
    ],
    recentReviews: [
      { reviewId: 'rv-4', bookingId: 'bk-3', clientId: 'u-client-1', companionId: 'comp-4', rating: 5, comment: 'Ảnh đẹp xuất sắc!', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), authorName: 'Nam T.', postedAt: '1 tuần trước' },
    ],
    featuredScenario: { title: 'Chụp ảnh kỷ niệm', price: 500 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-5',
    displayName: 'Võ Kim Ngân',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-5',
    biography: 'Thích xem phim, đọc sách, và trà sữa. Cùng mình thư giãn cuối tuần nhé.',
    availableCities: ['TP.HCM'],
    averageRating: 4.5,
    totalReviews: 8,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-5-1', title: 'Xem phim cùng nhau', description: 'Chọn phim yêu thích và cùng xem', durationMinutes: 150, price: 200, publicPlace: 'CGV Vincom, TP.HCM' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Xem phim cùng nhau', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-6',
    displayName: 'Đinh Thúy Vy',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-6',
    biography: 'Sinh viên năm cuối, năng động và hài hước.',
    availableCities: ['Hà Nội'],
    averageRating: 4.2,
    totalReviews: 3,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-6-1', title: 'Du lịch 1 ngày', description: 'Khám phá Hà Nội cùng nhau', durationMinutes: 240, price: 400, publicPlace: 'Hồ Tây, Hà Nội' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Du lịch 1 ngày', price: 400 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-7',
    displayName: 'Huỳnh Anh Thư',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-7',
    biography: 'Đầu bếp nghiệp dư, thích nấu ăn và chia sẻ công thức.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.7,
    totalReviews: 15,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { scenarioId: 'sc-7-1', title: 'Nấu ăn tại nhà', description: 'Cùng nấu một bữa ăn ngon', durationMinutes: 120, price: 350, publicPlace: 'Nhà riêng, Đà Nẵng' },
    ],
    recentReviews: [],
    featuredScenario: { title: 'Nấu ăn tại nhà', price: 350 },
    status: 'APPROVED',
  },
  // --- 20 COMPANIONS BỔ SUNG (comp-8 tới comp-27) ---
  {
    companionId: 'comp-8',
    displayName: 'Nguyễn Hoàng Yến',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-8',
    biography: 'Thích âm nhạc cổ điển và vẽ tranh. Rất vui được gặp các bạn.',
    availableCities: ['Hà Nội'],
    averageRating: 4.8,
    totalReviews: 9,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-8-1', title: 'Triển lãm nghệ thuật', description: 'Cùng tham quan triển lãm tranh', durationMinutes: 90, price: 220, publicPlace: 'Tràng Tiền, Hà Nội' }],
    recentReviews: [],
    featuredScenario: { title: 'Triển lãm nghệ thuật', price: 220 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-9',
    displayName: 'Phan Thị Ngọc Diệp',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-9',
    biography: 'Thích leo núi, dã ngoại và chụp ảnh thiên nhiên.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.5,
    totalReviews: 14,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-9-1', title: 'Dã ngoại Sơn Trà', description: 'Khám phá bán đảo Sơn Trà', durationMinutes: 180, price: 320, publicPlace: 'Sơn Trà, Đà Nẵng' }],
    recentReviews: [],
    featuredScenario: { title: 'Dã ngoại Sơn Trà', price: 320 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-10',
    displayName: 'Lâm Tú Quỳnh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-10',
    biography: 'Yêu động vật, đặc biệt là mèo. Rất thích trò chuyện.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 30,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-10-1', title: 'Cà phê mèo', description: 'Đi uống nước tại quán cà phê mèo', durationMinutes: 60, price: 160, publicPlace: 'Quận 10, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Cà phê mèo', price: 160 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-11',
    displayName: 'Bùi Khánh Vy',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-11',
    biography: 'Thích đọc sách tâm lý học và đi dạo buổi tối.',
    availableCities: ['Hà Nội'],
    averageRating: 4.7,
    totalReviews: 12,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-11-1', title: 'Dạo quanh Hồ Gươm', description: 'Trò chuyện và ngắm cảnh phố đi bộ', durationMinutes: 90, price: 180, publicPlace: 'Hoàn Kiếm, Hà Nội' }],
    recentReviews: [],
    featuredScenario: { title: 'Dạo quanh Hồ Gươm', price: 180 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-12',
    displayName: 'Trương Mỹ Linh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-12',
    biography: 'Yêu thích thời trang, shopping và làm đẹp. Cùng đi mua sắm nhé!',
    availableCities: ['TP.HCM'],
    averageRating: 4.6,
    totalReviews: 5,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-12-1', title: 'Shopping & Tư vấn thời trang', description: 'Đi mua sắm tại TTTM', durationMinutes: 120, price: 300, publicPlace: 'Takashimaya, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Shopping & Tư vấn thời trang', price: 300 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-13',
    displayName: 'Đặng Mai Phương',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-13',
    biography: 'Giáo viên dạy tiếng Anh, cởi mở và thích kết bạn mới.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.9,
    totalReviews: 22,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-13-1', title: 'Học tiếng Anh giao tiếp', description: 'Trò chuyện bằng tiếng Anh', durationMinutes: 60, price: 250, publicPlace: 'Hải Châu, Đà Nẵng' }],
    recentReviews: [],
    featuredScenario: { title: 'Học tiếng Anh giao tiếp', price: 250 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-14',
    displayName: 'Dương Thu Thủy',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-14',
    biography: 'Vui vẻ, năng động, thích các hoạt động ngoài trời.',
    availableCities: ['Hà Nội'],
    averageRating: 4.4,
    totalReviews: 8,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-14-1', title: 'Đạp xe Tây Hồ', description: 'Đạp xe quanh hồ và trò chuyện', durationMinutes: 120, price: 200, publicPlace: 'Tây Hồ, Hà Nội' }],
    recentReviews: [],
    featuredScenario: { title: 'Đạp xe Tây Hồ', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-15',
    displayName: 'Ngô Trúc Mai',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-15',
    biography: 'Yêu thích làm bánh ngọt, chụp ảnh và cà phê.',
    availableCities: ['TP.HCM'],
    averageRating: 4.8,
    totalReviews: 19,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-15-1', title: 'Thưởng trà & Bánh ngọt', description: 'Gặp gỡ tại tiệm trà chiều', durationMinutes: 90, price: 220, publicPlace: 'Quận 3, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Thưởng trà & Bánh ngọt', price: 220 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-16',
    displayName: 'Hoàng Thảo Nguyên',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-16',
    biography: 'Thích thơ ca, nhạc nhẹ và cuộc sống bình yên.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.7,
    totalReviews: 7,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-16-1', title: 'Đi dạo ngắm hoàng hôn', description: 'Dạo bộ bờ sông Hàn chiều muộn', durationMinutes: 60, price: 150, publicPlace: 'Sông Hàn, Đà Nẵng' }],
    recentReviews: [],
    featuredScenario: { title: 'Đi dạo ngắm hoàng hôn', price: 150 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-17',
    displayName: 'Đỗ Hải Đường',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-17',
    biography: 'Nhiệt huyết, thích chia sẻ về khởi nghiệp và kinh doanh.',
    availableCities: ['TP.HCM'],
    averageRating: 4.3,
    totalReviews: 4,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-17-1', title: 'Cà phê Business', description: 'Trò chuyện trao đổi công việc', durationMinutes: 90, price: 350, publicPlace: 'Quận 2, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Cà phê Business', price: 350 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-18',
    displayName: 'Vũ Ngọc Trâm',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-18',
    biography: 'Thích ca hát, đàn guitar và nói chuyện hài hước.',
    availableCities: ['Hà Nội'],
    averageRating: 4.9,
    totalReviews: 26,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-18-1', title: 'Hát live acoustic', description: 'Cùng hát giao lưu acoustic', durationMinutes: 90, price: 280, publicPlace: 'Cầu Giấy, Hà Nội' }],
    recentReviews: [],
    featuredScenario: { title: 'Hát live acoustic', price: 280 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-19',
    displayName: 'Cao Tuyết Nhung',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-19',
    biography: 'Thích tập gym, ăn healthy và chăm sóc sức khỏe.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.6,
    totalReviews: 15,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-19-1', title: 'Tập Gym & Fitness', description: 'Cùng tập luyện nâng cao thể lực', durationMinutes: 90, price: 200, publicPlace: 'Hải Châu, Đà Nẵng' }],
    recentReviews: [],
    featuredScenario: { title: 'Tập Gym & Fitness', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-20',
    displayName: 'Lý Kim Chi',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-20',
    biography: 'Thích chụp hình retro, đi cafe vintage và ngắm phố.',
    availableCities: ['TP.HCM'],
    averageRating: 4.8,
    totalReviews: 11,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-20-1', title: 'Photo Tour Quận 5', description: 'Cùng đi chụp hình vintage ở Chợ Lớn', durationMinutes: 120, price: 260, publicPlace: 'Quận 5, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Photo Tour Quận 5', price: 260 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-21',
    displayName: 'Tạ Thảo Tiên',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-21',
    biography: 'Rất thích nấu đồ ăn Hàn Quốc và làm bánh.',
    availableCities: ['Hà Nội'],
    averageRating: 4.7,
    totalReviews: 13,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-21-1', title: 'Cùng làm bánh ngọt', description: 'Học và làm bánh ngọt cùng nhau', durationMinutes: 120, price: 300, publicPlace: 'Ba Đình, Hà Nội' }],
    recentReviews: [],
    featuredScenario: { title: 'Cùng làm bánh ngọt', price: 300 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-22',
    displayName: 'Kiều Minh Trang',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-22',
    biography: 'Thích hoa, làm vườn và cắm hoa nghệ thuật.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.5,
    totalReviews: 6,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-22-1', title: 'Workshop cắm hoa', description: 'Cùng cắm hoa và thư giãn', durationMinutes: 90, price: 220, publicPlace: 'Liên Chiểu, Đà Nẵng' }],
    recentReviews: [],
    featuredScenario: { title: 'Workshop cắm hoa', price: 220 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-23',
    displayName: 'Trần Vân Anh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-23',
    biography: 'Thiết kế đồ họa, thích game indie và anime.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 18,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-23-1', title: 'Cà phê Console Game', description: 'Cùng chơi game và trò chuyện', durationMinutes: 120, price: 250, publicPlace: 'Quận 1, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Cà phê Console Game', price: 250 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-24',
    displayName: 'Nguyễn Ngọc Diệp',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-24',
    biography: 'Yêu thích trà đạo, cờ vây và tìm hiểu lịch sử.',
    availableCities: ['Hà Nội'],
    averageRating: 4.8,
    totalReviews: 14,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-24-1', title: 'Trà đạo đàm đạo', description: 'Thưởng trà và trò chuyện nhẹ nhàng', durationMinutes: 90, price: 200, publicPlace: 'Đống Đa, Hà Nội' }],
    recentReviews: [],
    featuredScenario: { title: 'Trà đạo đàm đạo', price: 200 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-25',
    displayName: 'Đoàn Thanh Hằng',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-25',
    biography: 'Thích tập Pilates và tìm hiểu về tarot.',
    availableCities: ['Đà Nẵng'],
    averageRating: 4.6,
    totalReviews: 9,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-25-1', title: 'Trải bài Tarot cà phê', description: 'Cùng xem bài tarot vui vẻ', durationMinutes: 60, price: 180, publicPlace: 'Ngũ Hành Sơn, Đà Nẵng' }],
    recentReviews: [],
    featuredScenario: { title: 'Trải bài Tarot cà phê', price: 180 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-26',
    displayName: 'Hồ Phương Thảo',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-26',
    biography: 'Yêu thích piano và giao tiếp đa văn hóa.',
    availableCities: ['TP.HCM'],
    averageRating: 4.9,
    totalReviews: 21,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-26-1', title: 'Đàn piano & Ngoại ngữ', description: 'Trò chuyện học hỏi cùng nhau', durationMinutes: 90, price: 280, publicPlace: 'Bình Thạnh, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Đàn piano & Ngoại ngữ', price: 280 },
    status: 'APPROVED',
  },
  {
    companionId: 'comp-27',
    displayName: 'Mai Bảo Trân',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-27',
    biography: 'Nhân viên kế toán, trầm tính nhưng rất biết lắng nghe.',
    availableCities: ['TP.HCM'],
    averageRating: 4.7,
    totalReviews: 10,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [{ scenarioId: 'sc-27-1', title: 'Coffee & Trút bầu tâm sự', description: 'Cùng uống cà phê lắng nghe chia sẻ', durationMinutes: 60, price: 150, publicPlace: 'Phú Nhuận, TP.HCM' }],
    recentReviews: [],
    featuredScenario: { title: 'Coffee & Trút bầu tâm sự', price: 150 },
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
    clientName: 'Minh Khách',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-1',
    companionName: 'Nguyễn Thị Linh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-1',
    scenarioTitle: 'Cà phê & trò chuyện',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'ACCEPTED' as const,
    price: 150,
    chatRoomId: 'room-bk-1',
    publicPlace: 'Quận 1, TP.HCM',
    escrowStatus: 'held',
    chatRoomStatus: 'ACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot: {
      title: 'Cà phê & trò chuyện',
      price: 150,
      durationMinutes: 60,
      publicPlace: 'Quận 1, TP.HCM'
    }
  },
  {
    bookingId: 'bk-2',
    clientId: 'u-client-1',
    clientName: 'Minh Khách',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-2',
    companionName: 'Trần Hà My',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-2',
    scenarioTitle: 'Ăn tối tại nhà hàng',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: 'COMPLETED' as const,
    price: 250,
    chatRoomId: 'room-bk-2',
    publicPlace: 'Hoàn Kiếm, Hà Nội',
    escrowStatus: 'released',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: true,
    scenarioSnapshot: {
      title: 'Ăn tối tại nhà hàng',
      price: 250,
      durationMinutes: 90,
      publicPlace: 'Hoàn Kiếm, Hà Nội'
    }
  },
  {
    bookingId: 'bk-4',
    clientId: 'u-client-1',
    clientName: 'Minh Khách',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-3',
    companionName: 'Phạm Minh Anh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-3',
    scenarioTitle: 'Đi dạo & chụp ảnh',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: 'COMPLETED' as const,
    price: 200,
    chatRoomId: 'room-bk-4',
    publicPlace: 'Quận 2, TP.HCM',
    escrowStatus: 'released',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot: {
      title: 'Đi dạo & chụp ảnh',
      price: 200,
      durationMinutes: 90,
      publicPlace: 'Quận 2, TP.HCM'
    }
  },
  {
    bookingId: 'bk-3',
    clientId: 'u-client-1',
    clientName: 'Minh Khách',
    clientAvatarUrl: 'https://i.pravatar.cc/100?u=u-client-1',
    companionId: 'comp-4',
    companionName: 'Lê Thanh Thảo',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-4',
    scenarioTitle: 'Chụp ảnh kỷ niệm',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    status: 'PENDING' as const,
    price: 500,
    chatRoomId: null,
    publicPlace: 'Quận 3, TP.HCM',
    escrowStatus: 'frozen',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot: {
      title: 'Chụp ảnh kỷ niệm',
      price: 500,
      durationMinutes: 120,
      publicPlace: 'Quận 3, TP.HCM'
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
    { transactionId: 'tx-1', walletId: 'wall_kazuya_001', description: 'Nạp tiền VNPay', amount: 1000, type: 'CREDIT' as const, status: 'SUCCESS' as const, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { transactionId: 'tx-2', walletId: 'wall_kazuya_001', description: 'Đặt lịch · Ăn tối tại nhà hàng', amount: -250, type: 'DEBIT' as const, status: 'SUCCESS' as const, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { transactionId: 'tx-3', walletId: 'wall_kazuya_001', description: 'Đặt lịch · Cà phê & trò chuyện', amount: -150, type: 'DEBIT' as const, status: 'PENDING' as const, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { transactionId: 'tx-4', walletId: 'wall_kazuya_001', description: 'Đặt lịch · Chụp ảnh kỷ niệm', amount: -500, type: 'DEBIT' as const, status: 'PENDING' as const, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ] as WalletTransaction[],
}


// --- CHAT ---
const rawChatRooms = [
  {
    chatRoomId: 'room-bk-1',
    bookingId: 'bk-1',
    companionName: 'Nguyễn Thị Linh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-1',
    lastMessage: 'Hẹn gặp bạn nhé!',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'ACTIVE' as const,
    unreadCount: 2,
  },
  {
    chatRoomId: 'room-bk-2',
    bookingId: 'bk-2',
    companionName: 'Trần Hà My',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-2',
    lastMessage: 'Cảm ơn bạn rất nhiều!',
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
    { messageId: 'msg-1', roomId: 'room-bk-1', senderId: 'u-comp-1', content: 'Xin chào! Mình rất vui được gặp bạn 😊', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { messageId: 'msg-2', roomId: 'room-bk-1', senderId: 'u-client-1', content: 'Chào Linh! Mình cũng vậy. Hẹn gặp bạn ngày mai nhé', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { messageId: 'msg-3', roomId: 'room-bk-1', senderId: 'u-comp-1', content: 'Hẹn gặp bạn nhé!', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ],
  'room-bk-2': [
    { messageId: 'msg-4', roomId: 'room-bk-2', senderId: 'u-client-1', content: 'Buổi tối rất vui, cảm ơn Hà My nhé', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString() },
    { messageId: 'msg-5', roomId: 'room-bk-2', senderId: 'u-comp-2', content: 'Cảm ơn bạn rất nhiều!', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString() },
  ],
}

// --- NOTIFICATIONS ---
export const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Booking được xác nhận!',
    body: 'Linh đã xác nhận lịch hẹn Cà phê & trò chuyện của bạn.',
    type: 'BOOKING_ACCEPTED' as const,
    category: 'TRANSACTIONAL' as const,
    isRead: false,
    actionUrl: '/bookings/bk-1',
    bookingId: 'bk-1',
    senderName: 'Nguyễn Thị Linh',
    senderAvatar: getMockAvatarUrl('comp-1'),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Nạp tiền thành công',
    body: 'Bạn đã nạp thành công 1000 Kano-Coin vào ví.',
    type: 'PAYMENT_SUCCESS' as const,
    category: 'TRANSACTIONAL' as const,
    isRead: true,
    actionUrl: '/wallet',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    title: 'Mã xác thực OTP',
    body: 'Mã OTP để hoàn tất giao dịch đặt lịch là 582194. Có hiệu lực trong 5 phút.',
    type: 'OTP_CODE' as const,
    category: 'TRANSACTIONAL' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-4',
    title: 'Tin nhắn mới từ Linh',
    body: 'Hẹn gặp bạn ngày mai nhé! Mình sẽ đến đúng giờ.',
    type: 'CHAT_MESSAGE' as const,
    category: 'INTERACTION' as const,
    isRead: false,
    actionUrl: '/chat',
    bookingId: 'bk-1',
    senderName: 'Nguyễn Thị Linh',
    senderAvatar: getMockAvatarUrl('comp-1'),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-5',
    title: 'Voucher chào mừng thành viên mới 🌸',
    body: 'Kanojo gửi tặng bạn mã giảm giá 15% (KANOJONEW) áp dụng cho lần hẹn hò đầu tiên.',
    type: 'PROMOTION_VOUCHER' as const,
    category: 'PROMOTIONAL' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-6',
    title: 'Nhắc nhở: Cập nhật Profile',
    body: 'Hãy cập nhật hình ảnh đại diện và phần mô tả cá nhân để thu hút nhiều bạn gái hơn nhé!',
    type: 'PROFILE_REMINDER' as const,
    category: 'PROMOTIONAL' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-7',
    title: 'Hệ thống chuẩn bị bảo trì định kỳ',
    body: 'Kanojo sẽ tiến hành bảo trì hệ thống nâng cấp định kỳ từ 02:00 đến 04:00 ngày mai. Giao dịch thanh toán có thể bị gián đoạn.',
    type: 'SYSTEM_MAINTENANCE' as const,
    category: 'PROMOTIONAL' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

