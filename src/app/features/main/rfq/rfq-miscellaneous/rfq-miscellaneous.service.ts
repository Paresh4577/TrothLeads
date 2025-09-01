import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { IMiscellaneousPaymentLinkUWDto } from '@models/dtos';
import { IMiscellaneousPaymentProofSP } from '@models/dtos';
import { IMiscellaneousPolicyIssueDto } from '@models/dtos';
import { IMiscellaneousProposalSubmissionDto } from '@models/dtos';
import { IMiscellaneousQNbyUWDTO } from '@models/dtos';
import { IMiscellaneousQNSelectionSPDto } from '@models/dtos';
import { IMiscellaneousDTO } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqMiscellaneousService {
  constructor(private _http: HttpClient) { }

  public SendBack(body: ISendBackRejectDTO) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public Reject(body: ISendBackRejectDTO) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Download QN Document
  public DownloadQnDocument(id: number): Observable<Blob> {
    let apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  public CreateProposal(body: IMiscellaneousDTO) {
    let API = API_ENDPOINTS.RFQMiscellaneous.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IMiscellaneousDTO) {
    let API = API_ENDPOINTS.RFQMiscellaneous.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Quotation
  public SubmitEngineeringQuotation(body: IMiscellaneousQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQMiscellaneous.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Qn Selection SP
  public SubmitQNSelectionSP(body: IMiscellaneousQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQMiscellaneous.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Payment Link
  public SubmitPaymentLink(body: IMiscellaneousPaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQMiscellaneous.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Payment Proof
  public SubmitPaymentProof(body: IMiscellaneousPaymentProofSP) {
    let API = API_ENDPOINTS.RFQMiscellaneous.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Proposal Submission
  public SubmitProposalSubmission(body: IMiscellaneousProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQMiscellaneous.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Policy Issue
  public SubmitPolicyIssue(body: IMiscellaneousPolicyIssueDto) {
    let API = API_ENDPOINTS.RFQMiscellaneous.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
