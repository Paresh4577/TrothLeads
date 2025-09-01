import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';

@Injectable({
  providedIn: 'root'
})
export class MotorPlanListService {

  constructor(private _http:HttpClient) { }

  public createMotorProposal(body) {
    let api = API_ENDPOINTS.Motor.QuickQuote
    return this._http.post<ResponseMessage>(api,body,httpOptions)
  }
}
