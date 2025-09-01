import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IEngineeringQNbyUWDTO, IEngineeringRaiseDTO, IEngineeringPaymentLinkUWDto, IEngineeringPaymentProofSP, IEngineeringPolicyIssueDto, IEngineeringProposalSubmissionDto, IEngineeringQNSelectionSPDto } from '@models/dtos';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqEngineeringService {

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

  public CreateProposal(body: IEngineeringRaiseDTO) {
    let API = API_ENDPOINTS.RFQEngineering.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IEngineeringRaiseDTO) {
    let API = API_ENDPOINTS.RFQEngineering.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Quotation
  public SubmitEngineeringQuotation(body: IEngineeringQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQEngineering.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Qn Selection SP
  public SubmitQNSelectionSP(body: IEngineeringQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQEngineering.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Payment Link
  public SubmitPaymentLink(body: IEngineeringPaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQEngineering.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Payment Proof
  public SubmitPaymentProof(body: IEngineeringPaymentProofSP) {
    let API = API_ENDPOINTS.RFQEngineering.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Proposal Submission
  public SubmitProposalSubmission(body: IEngineeringProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQEngineering.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Engineering Policy Issue
  public SubmitPolicyIssue(body: IEngineeringPolicyIssueDto) {
    let API = API_ENDPOINTS.RFQEngineering.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }
}
