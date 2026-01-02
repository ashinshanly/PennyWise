// Design System Colors for Expense Tracker

export const Colors = {
  // Background colors
  background: '#0A0A0F',
  backgroundSecondary: '#12121A',
  card: '#1A1A2E',
  cardHighlight: '#252540',
  
  // Primary brand colors
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#5148CC',
  
  // Accent colors
  secondary: '#00D9FF',
  accent: '#FF6B9D',
  
  // Semantic colors
  success: '#00E676',
  successLight: '#69F0AE',
  danger: '#FF5252',
  dangerLight: '#FF8A80',
  warning: '#FFD740',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B8B8C7',
  textMuted: '#6E6E80',
  
  // Border & overlay
  border: '#2A2A40',
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Gradient presets
  gradients: {
    primary: ['#6C63FF', '#8B85FF'],
    secondary: ['#00D9FF', '#00B4D8'],
    success: ['#00E676', '#69F0AE'],
    card: ['#1A1A2E', '#252540'],
    purple: ['#667eea', '#764ba2'],
    sunset: ['#f093fb', '#f5576c'],
  },
};

// Category colors and icons
export const Categories = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'fast-food',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    icon: 'car',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#71E5DD'],
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'bag-handle',
    color: '#FFE66D',
    gradient: ['#FFE66D', '#FFED99'],
  },
  bills: {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: '#95E1D3',
    gradient: ['#95E1D3', '#B4EDE4'],
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'game-controller',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#E8C4E8'],
  },
  health: {
    id: 'health',
    name: 'Health',
    icon: 'medical',
    color: '#98D8C8',
    gradient: ['#98D8C8', '#B5E5D9'],
  },
  income: {
    id: 'income',
    name: 'Income',
    icon: 'wallet',
    color: '#00E676',
    gradient: ['#00E676', '#69F0AE'],
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#8E8E93',
    gradient: ['#8E8E93', '#ABABAF'],
  },
};

export type CategoryId = keyof typeof Categories;

// Typography
export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// Border radius
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};
