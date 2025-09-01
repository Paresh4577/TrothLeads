export interface VehicleApiResponse {
  status: string;
  type: string;
  totalCount: number;
  message: string;
  responseData: string;
  token: any;
}

export interface Vehicle {
  UserVehicleId: number;
  VehicleNo: string;
  OwnerName: string;
  IsActive: boolean;
  DateCreated?: string;
  CreatedBy?: string;
  DateUpdated?: string;
  UpdatedBy?: string;
} 

export interface SMSLog {
    id: number;
    message: string;
    recipient: string;
    sentDate: string;
    status: string;
  }