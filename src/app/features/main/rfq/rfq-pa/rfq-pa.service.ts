import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ILifeCounterOfferDto, ILifeLoadingPaymentLinkDto, ILifeLoadingPaymentProofDto, ILifePaymentLinkUWDto, ILifePaymentProofSP, ILifePolicyIssueDto, ILifeProposalSubmissionDto, ILifeQNbyUWDTO, ILifeQNSelectionSPDto } from '@models/dtos';
import { IPaRaiseDTO } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqPaService {

  constructor(private _http: HttpClient) { }

  public CreateProposal(body: IPaRaiseDTO) {
    let API = API_ENDPOINTS.RFQPAComp.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IPaRaiseDTO) {
    let API = API_ENDPOINTS.RFQPAComp.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Download QN Document
  public DownloadQnDocument(id: number): Observable<Blob> {
    let apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  // Life Quotation
  public SubmitQuotation(body: ILifeQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQPAComp.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Qn Selection SP
  public SubmitQNSelectionSP(body: ILifeQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQPAComp.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Link
  public SubmitPaymentLink(body: ILifePaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQPAComp.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Proof
  public SubmitPaymentProof(body: ILifePaymentProofSP) {
    let API = API_ENDPOINTS.RFQPAComp.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Proposal Submission
  public SubmitProposalSubmission(body: ILifeProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQPAComp.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Counter Offer
  public SubmitCounterOfferInfo(body: ILifeCounterOfferDto, IsSubmit: boolean) {
    let API = API_ENDPOINTS.RFQPAComp.CounterOffer + `/${IsSubmit}`;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Loading Payment Link
  public SubmitLoadingPaymentLink(body: ILifeLoadingPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQPAComp.LoadingPaymentLink + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Loading Payment Proof
  public SubmitLoadingPaymentProof(body: ILifeLoadingPaymentProofDto) {
    let API = API_ENDPOINTS.RFQPAComp.LoadingPaymentProof + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Policy Issue
  public SubmitPolicyIssue(body: ILifePolicyIssueDto) {
    let API = API_ENDPOINTS.RFQPAComp.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }



  public PamemberCardArray() {
    let memberArray = []
    memberArray = [{ title: 'Self', member: '/assets/icons/male.png', cover: 'SelfCoverRequired', gender: 'Male' },
    { title: 'Spouse', member: '/assets/icons/woman.png', cover: 'SpouseCoverRequired', gender: 'Female' },
    { title: 'Daughter', member: '/assets/icons/girl.png', cover: 'DaughterCoverRequired', gender: 'Female' },
    { title: 'Son', member: '/assets/icons/son.png', cover: 'SonCoverRequired', gender: 'Male' },
    // { title: 'Mother', member: '/assets/icons/mother.png', cover: 'MotherCoverRequired', gender: 'Female' },
    // { title: 'Father', member: '/assets/icons/father.png', cover: 'FatherCoverRequired', gender: 'Male' }
  ]

    return memberArray
  }



  public getdetailsFieldsList() {
    let detailsFieldsList = [

      { question: 'Name', require: true },
      { question: 'Are you currently taking any medications or have you taken any in the past?', require: true },
      { question: 'Medicine name,If any being taken', require: false },
      { question: 'Duration of Medicine used in year', require: false },
      { question: 'Undergone any surgery (or) any treatment taken till date?', require: true },
      { question: 'If Yes, then provide details of treatment taken.', require: false },
      { question: 'Affected by Corona anytime?', require: true },
      { question: 'If yes ,then year in which affected', require: false },
      { question: 'Height', require: true },
      { question: 'Weight (kg)', require: true },

      
      { question: 'Nominee Name', require: true },
      { question: 'DOB of Nominee', require: true },
      { question: 'Relation of Nominee with Proposer', require: true }
    ]


    return detailsFieldsList
  }
}
