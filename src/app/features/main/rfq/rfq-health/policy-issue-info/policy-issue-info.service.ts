import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IPolicyIssueDto } from '@models/dtos/config/RFQHealth';

@Injectable({
  providedIn: 'root'
})
export class PolicyIssueInfoService {

  constructor(private _http: HttpClient) { }

  public SubmitPolicyIssue(body: IPolicyIssueDto[]) {
    let API = API_ENDPOINTS.RFQ.PolicyIssueUW + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SendBack(body: IPolicyIssueDto) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public Reject(body: IPolicyIssueDto) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
