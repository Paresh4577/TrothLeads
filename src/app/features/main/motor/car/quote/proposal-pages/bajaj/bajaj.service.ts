import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { gResponseMessage, ResponseMessage } from '@models/common';
import { BajajMotorDto } from '@models/dtos/motor-insurance/bajaj';
import { IBajajMotorKYCDto } from '@models/dtos/motor-insurance/KYC/Bajaj/bajaj-motor-kyc-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BajajService {

  constructor(private _http: HttpClient) { }

  public createProposal(body: BajajMotorDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.BajajMotor.ProposalCreate
    return this._http.post<ResponseMessage>(api, body, httpOptions)
  }

  public KYC(body: IBajajMotorKYCDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.BajajMotor.KYC
    return this._http.post<ResponseMessage>(api, body, httpOptions)
  }

  public getPaymentStatus(TransactionNo: string): Observable<gResponseMessage<any>> {
    let api = API_ENDPOINTS.BajajMotor.PaymentStatus + TransactionNo;
    return this._http.get<gResponseMessage<any>>(api, httpOptions);
  }
}
