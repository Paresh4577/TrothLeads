import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { Observable } from 'rxjs';
import { ITravelQNbyUWDTO, ITravelCounterOfferDto, ITravelLoadingPaymentLinkDto, ITravelLoadingPaymentProofDto, ITravelPaymentLinkUWDto, 
    ITravelPaymentProofSP, ITravelPolicyIssueDto, ITravelProposalSubmissionDto, ITravelQNSelectionSPDto, ITravelRaiseDTO
} from '@models/dtos';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';

@Injectable({
    providedIn: 'root'
})
export class RfqTravelService {

    constructor(private _http: HttpClient) { }

    public CreateProposal(body: ITravelRaiseDTO) {
        let API = API_ENDPOINTS.RFQTravel.RFQRaise + '/true';
        return this._http.post<ResponseMessage>(API, body, httpOptions);
    }

    public UpdateProposal(body: ITravelRaiseDTO) {
        let API = API_ENDPOINTS.RFQTravel.RFQRaise + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

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

    // Travel Quotation
    public SubmitTravelQuotation(body: ITravelQNbyUWDTO) {
        let API = API_ENDPOINTS.RFQTravel.QNByUW + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Qn Selection SP
    public SubmitQNSelectionSP(body: ITravelQNSelectionSPDto) {
        let API = API_ENDPOINTS.RFQTravel.QNSelectionSP + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Payment Link
    public SubmitPaymentLink(body: ITravelPaymentLinkUWDto) {
        let API = API_ENDPOINTS.RFQTravel.PaymentLinkUW + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Payment Proof
    public SubmitPaymentProof(body: ITravelPaymentProofSP) {
        let API = API_ENDPOINTS.RFQTravel.PaymentProofSP + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Proposal Submission
    public SubmitProposalSubmission(body: ITravelProposalSubmissionDto) {
        let API = API_ENDPOINTS.RFQTravel.ProposalSubmissionUW + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Counter Offer
    public SubmitCounterOfferInfo(body: ITravelCounterOfferDto, IsSubmit: boolean) {
        let API = API_ENDPOINTS.RFQTravel.CounterOffer + `/${IsSubmit}`;
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Loading Payment Link
    public SubmitLoadingPaymentLink(body: ITravelLoadingPaymentLinkDto) {
        let API = API_ENDPOINTS.RFQTravel.LoadingPaymentLink + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Loading Payment Proof
    public SubmitLoadingPaymentProof(body: ITravelLoadingPaymentProofDto) {
        let API = API_ENDPOINTS.RFQTravel.LoadingPaymentProof + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    // Travel Policy Issue
    public SubmitPolicyIssue(body: ITravelPolicyIssueDto) {
        let API = API_ENDPOINTS.RFQTravel.PolicyIssueUW + '/true';
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }
}
