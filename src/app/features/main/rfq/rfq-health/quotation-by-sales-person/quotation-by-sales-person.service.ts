import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { RfqHealthQuotation } from '@models/dtos/config/RFQHealth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationBySalesPersonService {
  private apiEndpoint: string;

  constructor(private _http: HttpClient) { }

  public SubmitOfflineQNPlanSelect(body: RfqHealthQuotation) {
    this.apiEndpoint = API_ENDPOINTS.RFQ.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(this.apiEndpoint, body, httpOptions);
  }

  public DownloadQnDocument(id: number) :Observable<Blob>{
    
    this.apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = this.apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api,{ responseType: 'blob' });
  }

  public QNSendBack(body) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public QNReject(body) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }



  public getdetailsFieldsList(){
    let detailsFieldsList = [
      { question: 'Name' ,require:true},
      { question: 'Do you Smoke/Drink/Chew Tobacco?' ,require:true},
      { question: 'Are you currently taking any medications or have you taken any in the past?' ,require:true},
      { question: 'Medicine name,If any being taken' ,require:false},
      { question: 'No. of years for which medicine is taken' ,require:false},
      { question: 'Undergone any surgery (or) any treatment taken till date?' ,require:true},
      { question: 'If Yes, then provide details of treatment taken.' ,require:false},
      { question: 'Height' ,require:true},
      { question: 'Weight (kg)' ,require:true},
      { question: 'Marital Status' ,require:true},
      { question: 'Occupation' ,require:true},
      { question: 'Nominee Name' ,require:true},
      { question: 'DOB of Nominee' ,require:true},
      { question: 'Relation of Nominee with Proposer' ,require:true},
      // { question: 'Was Health insurance taken in Previous year?' ,require:true},
      // { question: 'If yes, Then Last 1 Years Policy Details' ,require:false},
      // { question: 'If yes, Then Last 2 Years Policy Details', require: false },
      // { question: 'If yes, Then Last 3 Years Policy Details', require: false },
      // { question: 'Any Health Insurance Claim Made?' ,require:true},
      // { question: 'Claim Details, If any' ,require:false},
      { question: 'Affected by Corona anytime?' ,require:true},
      { question: 'If yes ,then year in which affected',require:false },
      { question: 'Have you ever been hospitalized before?',require:true },
      { question: 'If Yes, Date or Year of hospitalized',require:false },
      { question: 'Which treatment taken during hospitalization?',require:false },
    ]
 

    return detailsFieldsList
  }
}
