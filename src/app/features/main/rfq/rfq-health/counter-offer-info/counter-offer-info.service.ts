import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_ENDPOINTS } from "@config/api-endpoints.config";
import { httpOptions } from "@config/httpOptions";
import { ResponseMessage } from "@models/common";
import { ICounterOffersDto } from "@models/dtos/config/RFQHealth/counter-offer.dto";

@Injectable({
    providedIn: 'root'
})
export class CounterOfferInfoService {

    constructor(private _http: HttpClient) { }

    public SubmitCounterOfferInfo(body: ICounterOffersDto, IsSubmit:boolean) {
        let API = API_ENDPOINTS.RFQ.CounterOffer + `/${IsSubmit}`
        return this._http.put<ResponseMessage>(API, body, httpOptions)
    }
}
