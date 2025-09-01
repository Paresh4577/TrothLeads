export interface ApiResponse {
  resCode: number;
  isSuccess: boolean;
  message: string;
  data?: any,
  // alerts: any[]
}
