import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import {
  ILifeCounterOfferDto, ILifeLoadingPaymentLinkDto, ILifeLoadingPaymentProofDto, ILifePaymentLinkUWDto, ILifePaymentProofSP,
  ILifePolicyIssueDto, ILifeProposalSubmissionDto, ILifeQNbyUWDTO, ILifeQNSelectionSPDto, ILifeRaiseDTO,
} from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqLifeService {

  constructor(private _http: HttpClient) { }

  public CreateProposal(body: ILifeRaiseDTO) {
    let API = API_ENDPOINTS.RFQLife.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: ILifeRaiseDTO) {
    let API = API_ENDPOINTS.RFQLife.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Send back
  public SendBack(body: ISendBackRejectDTO) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Reject
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

  // Life Quotation
  public SubmitLifeQuotation(body: ILifeQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQLife.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Qn Selection SP
  public SubmitQNSelectionSP(body: ILifeQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQLife.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Link
  public SubmitPaymentLink(body: ILifePaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQLife.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Proof
  public SubmitPaymentProof(body: ILifePaymentProofSP) {
    let API = API_ENDPOINTS.RFQLife.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Proposal Submission
  public SubmitProposalSubmission(body: ILifeProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQLife.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Counter Offer
  public SubmitCounterOfferInfo(body: ILifeCounterOfferDto, IsSubmit: boolean) {
    let API = API_ENDPOINTS.RFQLife.CounterOffer + `/${IsSubmit}`;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Loading Payment Link
  public SubmitLoadingPaymentLink(body: ILifeLoadingPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQLife.LoadingPaymentLink + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Loading Payment Proof
  public SubmitLoadingPaymentProof(body: ILifeLoadingPaymentProofDto) {
    let API = API_ENDPOINTS.RFQLife.LoadingPaymentProof + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Policy Issue
  public SubmitPolicyIssue(body: ILifePolicyIssueDto) {
    let API = API_ENDPOINTS.RFQLife.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }


  public getdetailsFieldsList() {
    let detailsFieldsList = [
      { question: 'Name', require: true },
      { question: 'Place of Birth', require: true },
      { question: 'Email ID', require: true },
      { question: 'Height (feet / inch)', require: true },
      { question: 'Weight (kg)', require: true },
      {question: "Father's Name", require: true },
      { question: "Mother's Name", require: false },
      { question: 'Marrital Status', require: true },
      { question: 'Spouse Name', require: true },
      { question: 'Highest Qualifiaction', require: true },
      // { question: 'Occupation', require: true },
      // { question: 'Employer Name', require: true },
      // { question: 'Designation', require: true },
      // { question: 'Office Address', require: false },
      { question: 'Habit of Alcohol?', require: true },
    ]


    return detailsFieldsList
  }
}
