import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IGroupPaymentProofSP, IGroupQNbyUWDTO, IGroupRaiseDTO } from '@models/dtos';
import { IGroupPaymentLinkUWDto } from '@models/dtos';
import { IGroupPolicyIssueDto } from '@models/dtos';
import { IGroupProposalSubmissionDto } from '@models/dtos';
import { IGroupQNSelectionSPDto } from '@models/dtos';
import { ISendBackRejectDTO } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqGroupService {

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

  // Create Group Raised
  public CreateProposal(body: IGroupRaiseDTO) {
    let API = API_ENDPOINTS.RFQGroup.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  // Update Group Raised
  public UpdateProposal(body: IGroupRaiseDTO) {
    let API = API_ENDPOINTS.RFQGroup.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Group Quotation
  public SubmitQuotation(body: IGroupQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQGroup.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Group Qn Selection SP
  public SubmitQNSelectionSP(body: IGroupQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQGroup.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Group Payment Link
  public SubmitPaymentLink(body: IGroupPaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQGroup.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Group Payment Proof
  public SubmitPaymentProof(body: IGroupPaymentProofSP) {
    let API = API_ENDPOINTS.RFQGroup.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Group Proposal Submission
  public SubmitProposalSubmission(body: IGroupProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQGroup.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Group Policy Issue
  public SubmitPolicyIssue(body: IGroupPolicyIssueDto) {
    let API = API_ENDPOINTS.RFQGroup.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

}
