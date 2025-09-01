import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  

  constructor(private _http: HttpClient) {
  }


  // get plans
  GetPlans(body: any): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.Insurance.QuickQuote;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  // icici policy download
  public DownloadPolicy(PolicyNo: string,CorrelationId: string,CustomerId: string): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.ICICI.PlocyDownload + '?PolicyNo=' + PolicyNo + '&CorrelationId=' + CorrelationId + '&CustomerId=' + CustomerId;
    return this._http.get(_apiEndpoint, { responseType: 'blob' });
  }

  // care policy download
  public CareDownloadPolicy(PolicyNo: string): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.Care.PolicyDownload + '?PolicyNo=' + PolicyNo;
    return this._http.get(_apiEndpoint, { responseType: 'blob' });
  }

  // bajaj policy download
  public BajajDownloadPolicy(PolicyNo: string): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.BajajAllianzHealth.PolicyDownload + '?PolicyNo=' + PolicyNo;
    return this._http.get(_apiEndpoint, { responseType: 'blob' });
  }

  // aditya policy download
  public AdityaBirlaDownloadPolicy(PolicyNo: string): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.AdityaBirla.PolicyDownload + '?PolicyNo=' + PolicyNo;
    return this._http.get(_apiEndpoint, { responseType: 'blob' });
  }

  // godigit policy download
  public GoDigitDownloadPolicy(data:any): Observable<Blob> {
    let _apiEndpoint = API_ENDPOINTS.Godigit.PolicyDownload;
    return this._http.post(_apiEndpoint , data , { responseType: 'blob' });
  }

  // hdfc policy download
  public HDFCDownloadPolicy(data:any): Observable<Blob> {
    let _downlodAPI = API_ENDPOINTS.HDFC.PolicyDownload
    return this._http.post(_downlodAPI , data , { responseType: 'blob' });
  }

  // IFFCOTOKIO Policy Download
  public IFFCOTOKIODownloadPolicy(data:any): Observable<ResponseMessage> {
    let iffcoAPI = API_ENDPOINTS.IFFCO_TOKIO.PolicyDownload;
    return this._http.post<ResponseMessage>(iffcoAPI, data ,httpOptions );
  }

  // godigit Policy download JSON
  public GoDigitPolicyJson(data:any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.Godigit.PolicyDownload + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint , data ,httpOptions)
  }

  // HDFC Policy download JSON
  public HDFCPolicyJson(data:any): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.HDFC.PolicyDownload + '/true';
    return this._http.post<ResponseMessage>(_apiEndpoint , data ,httpOptions)
  }

  // AdityaBirla Policy download JSON
  public AdityaBirlaPolicyJson(PolicyNo: string): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.AdityaBirla.PolicyDownload + '/true?PolicyNo=' + PolicyNo
    return this._http.get<ResponseMessage>(_apiEndpoint ,httpOptions)
  }

  // Bajaj Policy download JSON
  public BajajPolicyJson(PolicyNo: string): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.BajajAllianzHealth.PolicyDownload + '/true?PolicyNo=' + PolicyNo;
    return this._http.get<ResponseMessage>(_apiEndpoint ,httpOptions)
  }

  // care Policy download JSON
  public CarePolicyJson(PolicyNo: string): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.Care.PolicyDownload + '/true?PolicyNo=' + PolicyNo;
    return this._http.get<ResponseMessage>(_apiEndpoint ,httpOptions)
  }

  // ICICI Policy download JSON
  public ICICIPolicyJson(PolicyNo: string,CorrelationId: string,CustomerId: string): Observable<ResponseMessage> {
    let _apiEndpoint = API_ENDPOINTS.ICICI.PlocyDownload + '/true?PolicyNo=' + PolicyNo + '&CorrelationId=' + CorrelationId + '&CustomerId=' + CustomerId;
    return this._http.get<ResponseMessage>(_apiEndpoint ,httpOptions)
  }

  // share plan details
  public SharePlans(data: any) {
    let url = API_ENDPOINTS.Insurance.ComparePDF;
    return this._http.post<any>(url, data, httpOptions);
  }

  // download plan details
  public DownloadPlans(data: any): Observable<Blob>   {
    let url = API_ENDPOINTS.Insurance.ComparePDF;
    return this._http.post(url, data, { responseType: 'blob' })
  }


  public openWindowWithPost(url, data) {
    var form = document.createElement("form");
    form.target = "_self";
    form.method = "POST";
    form.action = url;
    form.style.display = "none";

    for (var key in data) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }


}
