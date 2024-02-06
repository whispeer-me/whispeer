export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
}
