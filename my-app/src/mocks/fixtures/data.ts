// ============================================================
// MOCK FIXTURES — Static seed data
// Dùng cho MSW handlers trong development
// ============================================================

// --- AUTH ---
export const mockUsers = {
  guest: null,
  client: {
    id: 'u-client-1',
    email: 'minh.khach@example.com',
    displayName: 'Minh Khách',
    avatarUrl: 'https://i.pravatar.cc/100?u=client1',
    role: 'client' as const,
    companionApplicationStatus: 'idle' as const,
  },
  companion: {
    id: 'u-comp-1',
    email: 'linh.companion@example.com',
    displayName: 'Nguyễn Thị Linh',
    avatarUrl: 'https://i.pravatar.cc/100?u=comp1',
    role: 'companion' as const,
    companionApplicationStatus: 'approved' as const,
  },
  admin: {
    id: 'u-admin-1',
    email: 'admin@example.com',
    displayName: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/100?u=admin1',
    role: 'admin' as const,
    companionApplicationStatus: 'idle' as const,
  },
}

export let currentMockUser: typeof mockUsers[keyof typeof mockUsers] = mockUsers.client

export function setMockUser(role: keyof typeof mockUsers) {
  currentMockUser = mockUsers[role]
  console.log('[MSW] Switched user role to:', role)
}

// --- COMPANIONS ---
export const companions = [
  {
    id: 'comp-1',
    displayName: 'Nguyễn Thị Linh',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-1',
    bio: 'Mình thích cà phê, sách và những cuộc trò chuyện thú vị. Hãy cùng mình khám phá Sài Gòn nhé!',
    city: 'TP.HCM',
    ratingAvg: 4.8,
    reviewCount: 23,
    voiceIntroUrl: null,
    albumUrls: [
      'https://i.pravatar.cc/600?u=comp-1a',
      'https://i.pravatar.cc/600?u=comp-1b',
    ],
    scenarios: [
      { id: 'sc-1-1', name: 'Cà phê & trò chuyện', description: 'Gặp gỡ tại quán cà phê yên tĩnh', durationMinutes: 60, priceInCoin: 150, location: 'Quận 1, TP.HCM', isActive: true, isFeatured: true },
      { id: 'sc-1-2', name: 'Dạo phố Sài Gòn', description: 'Khám phá các con phố đẹp cùng nhau', durationMinutes: 120, priceInCoin: 300, location: 'Bến Nhà Rồng, TP.HCM', isActive: true, isFeatured: false },
    ],
    recentReviews: [
      { id: 'rv-1', authorName: 'Minh K.', authorAvatarUrl: 'https://i.pravatar.cc/50?u=rv1', rating: 5, comment: 'Rất thân thiện và vui tính!', postedAt: '2 ngày trước', isHidden: false },
    ],
    featuredScenario: { name: 'Cà phê & trò chuyện', priceInCoin: 150 },
    status: 'APPROVED',
  },
  {
    id: 'comp-2',
    displayName: 'Trần Hà My',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-2',
    bio: 'Food blogger, yêu ẩm thực và du lịch. Cùng mình khám phá quán ngon Hà Nội nhé.',
    city: 'Hà Nội',
    ratingAvg: 4.6,
    reviewCount: 11,
    voiceIntroUrl: null,
    albumUrls: ['https://i.pravatar.cc/600?u=comp-2a'],
    scenarios: [
      { id: 'sc-2-1', name: 'Ăn tối tại nhà hàng', description: 'Cùng thưởng thức bữa tối ngon', durationMinutes: 90, priceInCoin: 250, location: 'Hoàn Kiếm, Hà Nội', isActive: true, isFeatured: true },
    ],
    recentReviews: [],
    featuredScenario: { name: 'Ăn tối tại nhà hàng', priceInCoin: 250 },
    status: 'APPROVED',
  },
  {
    id: 'comp-3',
    displayName: 'Phạm Bảo Châu',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-3',
    bio: 'Giáo viên yoga, thích thiên nhiên và sống chậm.',
    city: 'Đà Nẵng',
    ratingAvg: 0,
    reviewCount: 0,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { id: 'sc-3-1', name: 'Yoga buổi sáng', description: 'Buổi tập yoga nhẹ nhàng', durationMinutes: 60, priceInCoin: 200, location: 'Bãi biển Mỹ Khê, Đà Nẵng', isActive: true, isFeatured: true },
    ],
    recentReviews: [],
    featuredScenario: { name: 'Yoga buổi sáng', priceInCoin: 200 },
    status: 'APPROVED',
  },
  {
    id: 'comp-4',
    displayName: 'Lê Thanh Thảo',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-4',
    bio: 'Nhiếp ảnh gia tự do, thích chụp ảnh phong cảnh và portrait.',
    city: 'TP.HCM',
    ratingAvg: 4.9,
    reviewCount: 47,
    voiceIntroUrl: null,
    albumUrls: ['https://i.pravatar.cc/600?u=comp-4a', 'https://i.pravatar.cc/600?u=comp-4b'],
    scenarios: [
      { id: 'sc-4-1', name: 'Chụp ảnh kỷ niệm', description: 'Buổi chụp ảnh chuyên nghiệp', durationMinutes: 120, priceInCoin: 500, location: 'Quận 3, TP.HCM', isActive: true, isFeatured: true },
    ],
    recentReviews: [
      { id: 'rv-4', authorName: 'Nam T.', authorAvatarUrl: 'https://i.pravatar.cc/50?u=rv4', rating: 5, comment: 'Ảnh đẹp xuất sắc!', postedAt: '1 tuần trước', isHidden: false },
    ],
    featuredScenario: { name: 'Chụp ảnh kỷ niệm', priceInCoin: 500 },
    status: 'APPROVED',
  },
  {
    id: 'comp-5',
    displayName: 'Võ Kim Ngân',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-5',
    bio: 'Thích xem phim, đọc sách, và trà sữa. Cùng mình thư giãn cuối tuần nhé.',
    city: 'TP.HCM',
    ratingAvg: 4.5,
    reviewCount: 8,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { id: 'sc-5-1', name: 'Xem phim cùng nhau', description: 'Chọn phim yêu thích và cùng xem', durationMinutes: 150, priceInCoin: 200, location: 'CGV Vincom, TP.HCM', isActive: true, isFeatured: true },
    ],
    recentReviews: [],
    featuredScenario: { name: 'Xem phim cùng nhau', priceInCoin: 200 },
    status: 'APPROVED',
  },
  {
    id: 'comp-6',
    displayName: 'Đinh Thúy Vy',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-6',
    bio: 'Sinh viên năm cuối, năng động và hài hước.',
    city: 'Hà Nội',
    ratingAvg: 4.2,
    reviewCount: 3,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { id: 'sc-6-1', name: 'Du lịch 1 ngày', description: 'Khám phá Hà Nội cùng nhau', durationMinutes: 240, priceInCoin: 400, location: 'Hồ Tây, Hà Nội', isActive: true, isFeatured: true },
    ],
    recentReviews: [],
    featuredScenario: { name: 'Du lịch 1 ngày', priceInCoin: 400 },
    status: 'APPROVED',
  },
  {
    id: 'comp-7',
    displayName: 'Huỳnh Anh Thư',
    avatarUrl: 'https://i.pravatar.cc/400?u=comp-7',
    bio: 'Đầu bếp nghiệp dư, thích nấu ăn và chia sẻ công thức.',
    city: 'Đà Nẵng',
    ratingAvg: 4.7,
    reviewCount: 15,
    voiceIntroUrl: null,
    albumUrls: [],
    scenarios: [
      { id: 'sc-7-1', name: 'Nấu ăn tại nhà', description: 'Cùng nấu một bữa ăn ngon', durationMinutes: 120, priceInCoin: 350, location: 'Nhà riêng, Đà Nẵng', isActive: true, isFeatured: true },
    ],
    recentReviews: [],
    featuredScenario: { name: 'Nấu ăn tại nhà', priceInCoin: 350 },
    status: 'APPROVED',
  },
]

// --- BOOKINGS ---
export const mockBookings = [
  {
    id: 'bk-1',
    companionId: 'comp-1',
    companionName: 'Nguyễn Thị Linh',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-1',
    scenarioName: 'Cà phê & trò chuyện',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'ACCEPTED',
    priceInCoin: 150,
    chatRoomId: 'room-bk-1',
    scenarioLocation: 'Quận 1, TP.HCM',
    escrowStatus: 'held',
  },
  {
    id: 'bk-2',
    companionId: 'comp-2',
    companionName: 'Trần Hà My',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-2',
    scenarioName: 'Ăn tối tại nhà hàng',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    priceInCoin: 250,
    chatRoomId: 'room-bk-2',
    scenarioLocation: 'Hoàn Kiếm, Hà Nội',
    escrowStatus: 'released',
  },
  {
    id: 'bk-3',
    companionId: 'comp-4',
    companionName: 'Lê Thanh Thảo',
    companionAvatarUrl: 'https://i.pravatar.cc/100?u=comp-4',
    scenarioName: 'Chụp ảnh kỷ niệm',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    status: 'PENDING',
    priceInCoin: 500,
    chatRoomId: null,
    scenarioLocation: 'Quận 3, TP.HCM',
    escrowStatus: 'frozen',
  },
]

// --- WALLET ---
export const mockWallet = {
  balance: 1200,
  frozenBalance: 650,
  transactions: [
    { id: 'tx-1', label: 'Nạp tiền VNPay', amountInCoin: 1000, type: 'credit', status: 'completed', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-2', label: 'Đặt lịch · Ăn tối tại nhà hàng', amountInCoin: -250, type: 'debit', status: 'completed', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-3', label: 'Đặt lịch · Cà phê & trò chuyện', amountInCoin: -150, type: 'debit', status: 'frozen', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-4', label: 'Đặt lịch · Chụp ảnh kỷ niệm', amountInCoin: -500, type: 'debit', status: 'frozen', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ],
}

// --- CHAT ---
export const mockChatRooms = [
  {
    id: 'room-bk-1',
    bookingId: 'bk-1',
    participantName: 'Nguyễn Thị Linh',
    participantAvatarUrl: 'https://i.pravatar.cc/100?u=comp-1',
    lastMessage: 'Hẹn gặp bạn nhé!',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isLocked: false,
    unreadCount: 2,
  },
  {
    id: 'room-bk-2',
    bookingId: 'bk-2',
    participantName: 'Trần Hà My',
    participantAvatarUrl: 'https://i.pravatar.cc/100?u=comp-2',
    lastMessage: 'Cảm ơn bạn rất nhiều!',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isLocked: true,
    unreadCount: 0,
  },
]

export const mockMessages: Record<string, Array<{
  id: string; senderId: string; senderName: string;
  content: string; sentAt: string; status: 'sent' | 'failed'
}>> = {
  'room-bk-1': [
    { id: 'msg-1', senderId: 'u-comp-1', senderName: 'Nguyễn Thị Linh', content: 'Xin chào! Mình rất vui được gặp bạn 😊', sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), status: 'sent' },
    { id: 'msg-2', senderId: 'u-client-1', senderName: 'Minh Khách', content: 'Chào Linh! Mình cũng vậy. Hẹn gặp bạn ngày mai nhé', sentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'sent' },
    { id: 'msg-3', senderId: 'u-comp-1', senderName: 'Nguyễn Thị Linh', content: 'Hẹn gặp bạn nhé!', sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: 'sent' },
  ],
  'room-bk-2': [
    { id: 'msg-4', senderId: 'u-client-1', senderName: 'Minh Khách', content: 'Buổi tối rất vui, cảm ơn Hà My nhé', sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(), status: 'sent' },
    { id: 'msg-5', senderId: 'u-comp-2', senderName: 'Trần Hà My', content: 'Cảm ơn bạn rất nhiều!', sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), status: 'sent' },
  ],
}

// --- NOTIFICATIONS ---
export const mockNotifications = [
  { id: 'notif-1', title: 'Booking được xác nhận!', body: 'Linh đã xác nhận lịch hẹn Cà phê & trò chuyện của bạn.', variant: 'booking', isRead: false, actionUrl: '/bookings/bk-1', receivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'notif-2', title: 'Nạp tiền thành công', body: 'Bạn đã nạp thành công 1000 Kano-Coin.', variant: 'wallet', isRead: true, actionUrl: '/wallet', receivedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
]
