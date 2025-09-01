import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IRFQHealthDto } from '@models/dtos/config/RFQHealth/rfqhealth-dto';

@Injectable({
  providedIn: 'root'
})
export class RFQHealthService {

  constructor(private _http: HttpClient) { }

  public CreateProposal(body: IRFQHealthDto) {
    let API = API_ENDPOINTS.RFQ.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IRFQHealthDto) {
    let API = API_ENDPOINTS.RFQ.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public memberCardArray() {
    let memberArray = [] 
    memberArray = [{title:'Self' , member:'/assets/icons/male.png',cover:'SelfCoverRequired',gender:'Male'},
                  {title:'Spouse' , member:'/assets/icons/woman.png',cover:'SpouseCoverRequired',gender:'Female'},
                  {title:'Daughter' , member:'/assets/icons/girl.png',cover:'DaughterCoverRequired',gender:'Female'},
                  {title:'Son' , member:'/assets/icons/son.png',cover:'SonCoverRequired',gender:'Male'},
                  {title:'Mother' , member:'/assets/icons/mother.png',cover:'MotherCoverRequired',gender:'Female'},
                  {title:'Father' , member:'/assets/icons/father.png',cover:'FatherCoverRequired',gender:'Male'}]
                  
    return memberArray
  }
}
