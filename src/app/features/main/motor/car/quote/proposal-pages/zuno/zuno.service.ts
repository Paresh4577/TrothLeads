import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IZunoMotorKYCDto } from '@models/dtos/motor-insurance/ZunoMotor/zuno-motor-kyc-dto';
import { IZunoMotorDto } from '@models/dtos/motor-insurance/ZunoMotor/ZunoMotor-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZunoService {

  constructor(private _http:HttpClient) { }

  public createProposal(body:IZunoMotorDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.ZunoMotor.ProposalCreate
    return this._http.post<ResponseMessage>(api,body,httpOptions)
  }

  public KYC(body:IZunoMotorKYCDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.ZunoMotor.KYC
    return this._http.post<ResponseMessage>(api,body,httpOptions)
  }
}
