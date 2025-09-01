import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IHDFCMotorKYCDto } from '@models/dtos/motor-insurance/KYC/HDFC/hdfcmotor-kycdto';
import { IHDFCMotorDto } from '@models/dtos/motor-insurance/two-wheeler/hdfc';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HdfcErgoService {

  constructor(private _http: HttpClient) { }

  public createProposal(body: IHDFCMotorDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.HDFCMotor.ProposalCreate
    return this._http.post<ResponseMessage>(api, body, httpOptions)
  }

  public KYC(body: IHDFCMotorKYCDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.HDFCMotor.KYC
    return this._http.post<ResponseMessage>(api, body, httpOptions)
  }
}
