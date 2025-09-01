import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ILoadingPaymentLinkDto } from '@models/dtos/config/RFQHealth/loading-payment-link.dto';

@Injectable({
    providedIn: 'root'
})
export class LoadingPaymentLinkService {

    constructor(private _http: HttpClient) { }

    public SubmitLoadingPaymentLink(body: ILoadingPaymentLinkDto) {
        let API = API_ENDPOINTS.RFQ.LoadingPaymentLink + "/true"
        return this._http.put<ResponseMessage>(API, body, httpOptions)
    }

    public SendBack(body: ILoadingPaymentLinkDto) {
        let API = API_ENDPOINTS.RFQ.SendBack;
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }

    public Reject(body: ILoadingPaymentLinkDto) {
        let API = API_ENDPOINTS.RFQ.Reject;
        return this._http.put<ResponseMessage>(API, body, httpOptions);
    }
}
