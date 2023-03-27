export interface HomeMeetApiResponse<T = unknown> {
  data?: T;
  message?: string;
  status?: 'success' | 'error';
  token?: string;
  passwordResetToken?: string;
  accessToken?: string;
  refreshToken?: string;
}
