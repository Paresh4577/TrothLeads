import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage, gResponseMessage } from '@models/common';
import { ITataAIAMotor, ITataAIAkycdto } from '@models/dtos/motor-insurance/TataAIA';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TataAiaService {
  constructor(private _http: HttpClient) { }

  public createProposal(body: ITataAIAMotor): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.TataAIAMotor.ProposalCreate;
    return this._http.post<ResponseMessage>(api, body, httpOptions);
  }

  public KYC(body: ITataAIAkycdto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.TataAIAMotor.KYC;
    return this._http.post<ResponseMessage>(api, body, httpOptions);
  }

  public Payment(TransactionNo: string): Observable<ResponseMessage> {
    let data = {
      TransactionNo: TransactionNo,
    };
    let api = API_ENDPOINTS.TataAIAMotor.Payment;
    return this._http.post<ResponseMessage>(api, data, httpOptions);
  }

  public BreakIn(TransactionNo: string): Observable<gResponseMessage<any>> {
    let api = API_ENDPOINTS.TataAIAMotor.PolicyStatus + "?TransactionNo=" + TransactionNo;
    return this._http.get<gResponseMessage<any>>(api, httpOptions);
  }

  // public (): Observable<ResponseMessage> {
  //   let api = API_ENDPOINTS.TataAIAMotor.PolicyStatus + "?TransactionNo=" + TransactionNo;
  //   return this._http.get<ResponseMessage>(api, TransactionNo);
  // }
}
