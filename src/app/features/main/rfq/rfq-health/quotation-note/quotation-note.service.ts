import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IQNByUWDto } from '@models/dtos/config/RFQHealth/quotation-note';

@Injectable({
  providedIn: 'root'
})
export class QuotationNoteService {

  constructor(private _http: HttpClient) { }

  public QNGenerate(body:IQNByUWDto) {
    let API = API_ENDPOINTS.RFQ.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public QNSendBack(body:IQNByUWDto) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public QNReject(body:IQNByUWDto) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
