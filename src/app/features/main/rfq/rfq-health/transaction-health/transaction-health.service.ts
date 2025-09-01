import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';

@Injectable({
  providedIn: 'root'
})
export class TransactionHealthService {

  constructor(private _http:HttpClient) { }

  public TransactionHealthSubmit(body) {
    let API = API_ENDPOINTS.RFQ.Transaction + '/true' 
    return this._http.post<ResponseMessage>(API,body,httpOptions)
  }
}
