import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IProposalSubmissionInfoDto } from '@models/dtos/config/RFQHealth/proposal-submission-info-dto';

@Injectable({
  providedIn: 'root'
})
export class ProposalSubmissionInfoService {

  constructor(private _http:HttpClient) {}

  public SubmitProposalSubmission(body: IProposalSubmissionInfoDto[]) {
    let API = API_ENDPOINTS.RFQ.ProposalSubmissionUW + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SendBack(body: IProposalSubmissionInfoDto) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public Reject(body: IProposalSubmissionInfoDto) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
