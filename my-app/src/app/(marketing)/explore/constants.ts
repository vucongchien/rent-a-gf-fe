import { CITIES } from '@/shared/constants/cities';

export const EXPLORE_FILTERS = [
  { id: 'all', label: 'All companions' },
  ...CITIES.map((c) => ({ id: c.code, label: c.label })),
];

export const SORT_OPTIONS = [
  { id: 'hot', label: 'Độ hot' },
  { id: 'price_asc', label: 'Giá thuê tăng dần' },
  { id: 'price_desc', label: 'Giá thuê giảm dần' },
];
