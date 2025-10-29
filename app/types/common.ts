// Common types used across the application

// Receipt related types
export interface Receipt {
  id: string;
  imageUrl: string;
  amount: number;
  store: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
}

// User profile information
export interface UserProfile {
  address: string;
  balance: {
    b3tr: string;
    vot3: string;
  };
  receipts: Receipt[];
  stakingInfo?: {
    totalStaked: string;
    rewards: string;
  };
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

// File upload types
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  type: string;
}

// Photo capture types
export interface PhotoCaptureResult {
  file: File;
  preview: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

// Blacklist information
export interface BlacklistInfo {
  isBlacklisted: boolean;
  reason?: string;
  timestamp?: string;
}

// Daily limit information
export interface DailyLimit {
  current: number;
  maximum: number;
  remaining: number;
  resetTime: string;
}

// Weekly points information
export interface WeeklyPoints {
  current: number;
  target: number;
  percentage: number;
  history: Array<{
    week: string;
    points: number;
  }>;
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "file" | "select";
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
}

// Modal props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
}

// Toast notification
export interface ToastOptions {
  title?: string;
  description?: string;
  status: "success" | "error" | "warning" | "info";
  duration?: number;
  isClosable?: boolean;
  position?:
    | "top"
    | "top-left"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-right";
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: string;
}

// Theme configuration
export interface ThemeConfig {
  initialColorMode: "light" | "dark" | "system";
  useSystemColorMode: boolean;
}

// Navigation item
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string | number;
  isActive?: boolean;
  isDisabled?: boolean;
}

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: "userPreferences",
  THEME_MODE: "themeMode",
  DISTRIBUTE_NOTICE: "ui:distributeNotice",
  LAST_VISIT: "lastVisit",
  TUTORIAL_COMPLETED: "tutorialCompleted",
} as const;

// Environment types
export type Environment = "development" | "staging" | "production";

// Network types
export type Network = "mainnet" | "testnet";

// Language codes
export type LanguageCode = "en" | "zh" | "es" | "fr" | "de" | "ja" | "ko";

// Currency codes
export type CurrencyCode = "USD" | "EUR" | "CNY" | "JPY" | "KRW";

// Status types
export type Status = "idle" | "loading" | "success" | "error";

// Sort order
export type SortOrder = "asc" | "desc";

// File types
export type FileType = "image" | "document" | "video" | "audio";

// Device types
export type DeviceType = "mobile" | "tablet" | "desktop";
