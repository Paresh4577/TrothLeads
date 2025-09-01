import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IPaymentLinkDto } from '@models/dtos/config/RFQHealth/payment-link-dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentLinkService {

  constructor(private _http:HttpClient) { }

  public SubmitPaymentLink(body:IPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQ.PaymentLinkUW + "/true"
    return this._http.put<ResponseMessage>(API,body,httpOptions)
  }

  public SendBack(body:IPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public Reject(body:IPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
