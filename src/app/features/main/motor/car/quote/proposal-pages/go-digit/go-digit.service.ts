import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IGoDigitMotorDto } from '@models/dtos/motor-insurance/go-digit';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoDigitService {

  constructor(private _http: HttpClient) { }

  public createProposal(body: IGoDigitMotorDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.GoDigitMotor.ProposalCreate
    return this._http.post<ResponseMessage>(api, body, httpOptions)
  }

  StatusKYCCheck(data: any) {
    let api = API_ENDPOINTS.GoDigitMotor.KYCStatus;
    return this._http.post<any>(api, data, httpOptions);
  }

  PaymentStatus(data: any): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.GoDigitMotor.Payment;
    return this._http.post<ResponseMessage>(api, data, httpOptions);
  }

}
