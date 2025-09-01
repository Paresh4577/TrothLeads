import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IPaymentProofDocumentDto, IPaymentProofDto } from '@models/dtos/config/RFQHealth';

@Injectable({
  providedIn: 'root'
})
export class PaymentProofService {

  private apiEndpoint: string;

  constructor(private _http: HttpClient) { }

  public SubmitPaymentProof(body: IPaymentProofDto[]) {
    let API = API_ENDPOINTS.RFQ.PaymentProofSP + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SendBack(body: IPaymentProofDto) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public Reject(body: IPaymentProofDto) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
