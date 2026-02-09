export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  gradientStart: string;
  gradientEnd: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
