import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ILifeQNbyUWDTO, ILifeQNSelectionSPDto, ILifePaymentLinkUWDto, ILifePaymentProofSP, ILifeProposalSubmissionDto, ILifeCounterOfferDto, ILifeLoadingPaymentLinkDto, ILifeLoadingPaymentProofDto, ILifePolicyIssueDto } from '@models/dtos';
import { IWcRaiseDTO } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqWcService {

  constructor(private _http: HttpClient) { }

  public CreateProposal(body: IWcRaiseDTO) {
    let API = API_ENDPOINTS.RFQWorkmenComp.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IWcRaiseDTO) {
    let API = API_ENDPOINTS.RFQWorkmenComp.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Download QN Document
  public DownloadQnDocument(id: number): Observable<Blob> {
    let apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  // Life Quotation
  public SubmitLifeQuotation(body: ILifeQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQWorkmenComp.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Qn Selection SP
  public SubmitQNSelectionSP(body: ILifeQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQWorkmenComp.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Link
  public SubmitPaymentLink(body: ILifePaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQWorkmenComp.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Proof
  public SubmitPaymentProof(body: ILifePaymentProofSP) {
    let API = API_ENDPOINTS.RFQWorkmenComp.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Proposal Submission
  public SubmitProposalSubmission(body: ILifeProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQWorkmenComp.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Counter Offer
  public SubmitCounterOfferInfo(body: ILifeCounterOfferDto, IsSubmit: boolean) {
    let API = API_ENDPOINTS.RFQWorkmenComp.CounterOffer + `/${IsSubmit}`;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Loading Payment Link
  public SubmitLoadingPaymentLink(body: ILifeLoadingPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQWorkmenComp.LoadingPaymentLink + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Loading Payment Proof
  public SubmitLoadingPaymentProof(body: ILifeLoadingPaymentProofDto) {
    let API = API_ENDPOINTS.RFQWorkmenComp.LoadingPaymentProof + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Policy Issue
  public SubmitPolicyIssue(body: ILifePolicyIssueDto) {
    let API = API_ENDPOINTS.RFQWorkmenComp.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
