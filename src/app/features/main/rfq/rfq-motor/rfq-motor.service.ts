import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ICounterOfferDto, ILoadingPaymentLinkDto, ILoadingPaymentProofDto, IMotorQNSelectionDTO, IMotorRaiseDTO, IPaymentLinkDto, IPaymentProofDto, IPolicyIssueDto, IProposalSubmissionDto, MotorQNbyUWDTO } from '@models/dtos/config/RFQMotor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqMotorService {

  private apiEndpoint: string;

  constructor(private _http: HttpClient) { }

  public CreateProposal(body: IMotorRaiseDTO) {
    let API = API_ENDPOINTS.RFQMotor.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IMotorRaiseDTO) {
    let API = API_ENDPOINTS.RFQMotor.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public SubmitLoadingPaymentLink(body: ILoadingPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQMotor.LoadingPaymentLink + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SubmitLoadingPaymentProof(body: ILoadingPaymentProofDto[]) {
    let API = API_ENDPOINTS.RFQMotor.LoadingPaymentProof + "/true";
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public SubmitMotorQuotation(body: MotorQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQMotor.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }


  public SubmitMotorQuotationSelection(body: IMotorQNSelectionDTO) {
    let API = API_ENDPOINTS.RFQMotor.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public DownloadQnDocument(id: number): Observable<Blob> {

    this.apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = this.apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  public SubmitCounterOfferInfo(body: ICounterOfferDto, IsSubmit: boolean) {
    let API = API_ENDPOINTS.RFQMotor.CounterOffer + `/${IsSubmit}`
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SubmitPaymentLink(body: IPaymentLinkDto) {
    let API = API_ENDPOINTS.RFQMotor.PaymentLinkUW + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SubmitPaymentProof(body: IPaymentProofDto[]) {
    let API = API_ENDPOINTS.RFQMotor.PaymentProofSP + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SubmitPolicyIssue(body: IPolicyIssueDto[]) {
    let API = API_ENDPOINTS.RFQMotor.PolicyIssueUW + "/true"
    return this._http.put<ResponseMessage>(API, body, httpOptions)
  }

  public SubmitProposalSubmission(body: IProposalSubmissionDto[]) {
    let API = API_ENDPOINTS.RFQMotor.ProposalSubmissionUW + "/true";
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
