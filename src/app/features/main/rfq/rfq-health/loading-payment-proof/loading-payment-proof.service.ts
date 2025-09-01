import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IPaymentProofDocumentDto, IPaymentProofDto } from '@models/dtos/config/RFQHealth';
import { ILoadingPaymentDetailsDto } from '@models/dtos/config/RFQHealth/loading-payment-proof.dto';

@Injectable({
    providedIn: 'root'
})
export class LoadingPaymentProofService {

    constructor(private _http: HttpClient) { }

    public SubmitPaymentProof(body: ILoadingPaymentDetailsDto[]) {
        let API = API_ENDPOINTS.RFQ.LoadingPaymentProof + "/true"
        return this._http.put<ResponseMessage>(API, body, httpOptions)
    }

    public SendBack(body: ILoadingPaymentDetailsDto) {
        let API = API_ENDPOINTS.RFQ.SendBack;
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    public Reject(body: ILoadingPaymentDetailsDto) {
        let API = API_ENDPOINTS.RFQ.Reject;
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }
}
