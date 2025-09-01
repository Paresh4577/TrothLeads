import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubsourceService {

  constructor(private _http:HttpClient) { }

  /**
   *  SubSource APIs
   */
  getSubSourceList(body: any): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.SubSource.List;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  createSubSource(body: any): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.SubSource.Base;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  getSubSource(Id: number): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.SubSource.Base + '/' + Id;
    return this._http.get<ResponseMessage>(url, httpOptions);
  }

  deleteSubSource(Id: number): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.SubSource.Base + '/' + Id;
    return this._http.delete<ResponseMessage>(url, httpOptions);
  }

  updateSubSource(body: any): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.SubSource.Base;
    return this._http.put<ResponseMessage>(url, body, httpOptions);
  }
}
