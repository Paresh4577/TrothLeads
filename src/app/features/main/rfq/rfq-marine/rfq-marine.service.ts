import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { IMarinePaymentLinkUWDto, IMarinePaymentProofSP, IMarineRaiseDTO } from '@models/dtos';
import { IMarineCounterOfferDto } from '@models/dtos';
import { IMarineLoadingPaymentLinkDto } from '@models/dtos';
import { IMarineLoadingPaymentProofDto } from '@models/dtos';
import { IMarinePolicyIssueDto } from '@models/dtos/config';
import { IMarineProposalSubmissionDto } from '@models/dtos';
import { IMarineQNbyUWDTO } from '@models/dtos/config';
import { IMarineQNSelectionSPDto } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RFQMarineService {

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

  public CreateProposal(body: IMarineRaiseDTO) {
    let API = API_ENDPOINTS.RFQMarine.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IMarineRaiseDTO) {
    let API = API_ENDPOINTS.RFQMarine.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Quotation
  public SubmitMarineQuotation(body: IMarineQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQMarine.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Qn Selection SP
  public SubmitQNSelectionSP(body: IMarineQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQMarine.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Payment Link
  public SubmitPaymentLink(body: IMarinePaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQMarine.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Payment Proof
  public SubmitPaymentProof(body: IMarinePaymentProofSP) {
    let API = API_ENDPOINTS.RFQMarine.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Proposal Submission
  public SubmitProposalSubmission(body: IMarineProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQMarine.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Counter Offer
  public SubmitCounterOfferInfo(body: IMarineCounterOfferDto, IsSubmit: boolean) {
    let API = API_ENDPOINTS.RFQMarine.CounterOffer + `/${IsSubmit}`;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Loading Payment Link
  public SubmitLoadingPaymentLink(body: IMarineLoadingPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQMarine.LoadingPaymentLink + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Loading Payment Proof
  public SubmitLoadingPaymentProof(body: IMarineLoadingPaymentProofDto) {
    let API = API_ENDPOINTS.RFQMarine.LoadingPaymentProof + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Marine Policy Issue
  public SubmitPolicyIssue(body: IMarinePolicyIssueDto) {
    let API = API_ENDPOINTS.RFQMarine.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

}
