import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotorQuoteService {

  constructor(private _http: HttpClient) { }


  // hdfc policy download
  public HDFCDownloadPolicy(data: any): Observable<Blob> {
    let _downlodAPI = API_ENDPOINTS.HDFCMotor.DownloadPolicy
    return this._http.post(_downlodAPI, data, { responseType: 'blob' });
  }

  // HDFC Policy download JSON
  public HDFCPolicyJson(data: any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.HDFCMotor.DownloadPolicy + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint, data, httpOptions)
  }

  // Zuno policy download
  public ZunoDownloadPolicy(data: any): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.ZunoMotor.DownloadPolicy;
    return this._http.post(_apiEndpoint, data, { responseType: 'blob' })
  }

  // Zuno Policy  JSON
  public ZunoDownloadjson(data: any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.ZunoMotor.DownloadPolicy + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint, data, httpOptions)
  }

  // TATA AIA Policy  JSON
  public TATAAIADownloadjson(data: any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.TataAIAMotor.DownloadPolicy + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint, data, httpOptions)
  }

  // TATA AIA policy download
  public TATAAIADownloadPolicy(data: any): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.TataAIAMotor.DownloadPolicy;
    return this._http.post(_apiEndpoint, data, { responseType: 'blob' })
  }

  // BAJAJ Policy download JSON
  public BAJAJPolicyJson(data: any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.BajajMotor.DownloadPolicy + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint, data, httpOptions)
  }

  // BAJAJ policy download
  public BAJAJDownloadPolicy(data: any): Observable<Blob> {
    let _downlodAPI = API_ENDPOINTS.BajajMotor.DownloadPolicy
    return this._http.post(_downlodAPI, data, { responseType: 'blob' });
  }

  // Go Digit Policy download JSON
  public GoDigitPolicyJson(data: any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.GoDigitMotor.DownloadPolicy + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint, data, httpOptions)
  }

  // Go Digit policy download
  public GoDigitDownloadPolicy(data: any): Observable<Blob> {
    let _downlodAPI = API_ENDPOINTS.GoDigitMotor.DownloadPolicy
    return this._http.post(_downlodAPI, data, { responseType: 'blob' });
  }
}
