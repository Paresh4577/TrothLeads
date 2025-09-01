import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { ILiabilityDTO, ILiabilityQNbyUWDTO, ILiabilityQNSelectionSPDto, ILiabilityPaymentLinkUWDto, ILiabilityPaymentProofSP, ILiabilityProposalSubmissionDto, ILiabilityPolicyIssueDto } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqLiabilityService {

  constructor(private _http: HttpClient) { }

  public sendBack(body: ISendBackRejectDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public reject(body: ISendBackRejectDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Download QN Document
  public downloadQnDocument(id: number): Observable<Blob> {
    let apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  public createProposal(body: ILiabilityDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public updateProposal(body: ILiabilityDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Liability Quotation
  public submitQuotation(body: ILiabilityQNbyUWDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Liability Qn Selection SP
  public submitQNSelectionSP(body: ILiabilityQNSelectionSPDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Liability Payment Link
  public submitPaymentLink(body: ILiabilityPaymentLinkUWDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Liability Payment Proof
  public submitPaymentProof(body: ILiabilityPaymentProofSP): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Liability Proposal Submission
  public submitProposalSubmission(body: ILiabilityProposalSubmissionDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Liability Policy Issue
  public submitPolicyIssue(body: ILiabilityPolicyIssueDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQLiability.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
