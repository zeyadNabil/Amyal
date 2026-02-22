export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  gradientStart: string;
  gradientEnd: string;
  updatedAt?: string;
  name?: string;
  id?: string;
  /** Advanced mode only */
  borderColor?: string;
  backgroundColorDarker?: string;
  backgroundColorNavy?: string;
  mutedTextColor?: string;
  linkColor?: string;
  cardBorderColor?: string;
}

/** Saved theme preset with name for admin selection */
export interface SavedTheme {
  id: string;
  name: string;
  theme: Theme;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
  /** Optional image as base64 data URL; shown only on detail page and admin View full */
  image?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
