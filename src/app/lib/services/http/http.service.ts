import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { httpOptions } from '@config/httpOptions';
import { IQuerySpecs, ResponseMessage } from '@models/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private _apiEndpoint: string;
  constructor(private _http: HttpClient) { }

  /**
   * GET
   * @param api
   * @returns
   */
  public getAttachmentDownload(api: string): Observable<any> {
    return this._http.get(api, { responseType: 'blob' });
  }

  /**
   * GET
   * @param id
   * @param api
   * @returns
   */
  public getDataById(id: any, api: string): Observable<any> {
    this._apiEndpoint = api + "/" + id;
    return this._http.get<any>(this._apiEndpoint, httpOptions);
  }

    /**
   * GET
   * @param api
   * @returns
   */
    public getDataByAPI(api: string): Observable<any> {
      this._apiEndpoint = api;
      return this._http.get<any>(this._apiEndpoint, httpOptions);
    }

  /**
   * for Product
  * GET
  * @param code
  * @param icode
  * @param api
  * @returns
  */
  public getDataByCode(code: any, icode: any, api: string): Observable<any> {
    this._apiEndpoint = api + "/" + code + "/" + icode;
    return this._http.get<any>(this._apiEndpoint, httpOptions);
  }


  /**
   * post
   * @param id
   * @param api
   * @returns
   */

  public getDataList(querySpec: any, api: string) {
    this._apiEndpoint = api + "/list";
    return this._http.post<any>(this._apiEndpoint, querySpec, httpOptions);
  }

  /**
   * For RFQ data list function
   * this is flag wise provide list in case of "permissionBase" is "true" then user role wise data show in rfq list page and "false" then all data show in rfq list page
   */
  public getRFQDataList(querySpec: any, api: string, permissionBase: boolean) {
    this._apiEndpoint = api + "/list/" + permissionBase;
    return this._http.post<any>(this._apiEndpoint, querySpec, httpOptions);
  }

  public getDataListCoShare(querySpec: any, api: string) {
    this._apiEndpoint = api + "/list/CoSharewise";
    return this._http.post<any>(this._apiEndpoint, querySpec, httpOptions);
  }

  public getRenewalEndorsementList(querySpec: any, api: string) {
    this._apiEndpoint = api + "/list/CoSharewise/true";
    return this._http.post<any>(this._apiEndpoint, querySpec, httpOptions);
  }

  public approveReject(body: any, api: string): Observable<ResponseMessage> {
    this._apiEndpoint = api;
    return this._http.put<ResponseMessage>(this._apiEndpoint, body, httpOptions)
  }

  createData(body: any, api: string): Observable<ResponseMessage> {
    this._apiEndpoint = api;
    return this._http.post<ResponseMessage>(this._apiEndpoint, body, httpOptions);
  }

  public getData(querySpec: any, api: string) {
    this._apiEndpoint = api;
    return this._http.post<any>(this._apiEndpoint, querySpec, httpOptions);
  }
  
  public exportToExcel(query: IQuerySpecs, api: string): Observable<Blob> {
    this._apiEndpoint = api;
    return this._http.post(this._apiEndpoint, query, { responseType: "blob" });
  }

  /**
   * put
   * @param id
   * @param api
   * @returns
   */
  public updateData(data: any, api: string) {
    this._apiEndpoint = api;
    return this._http.put<any>(this._apiEndpoint, data, httpOptions);
  }


  /**
   * delete
   * @param id
   * @param api
   * @returns
   */
  deleteData(id: string, api: string): Observable<ResponseMessage> {
    this._apiEndpoint = api + "/" + id;
    return this._http.delete<ResponseMessage>(this._apiEndpoint, httpOptions);
  }

  /**
   * delete
   * @param id
   * @param api
   * @param status
   * @returns
   */
  cancelData(id: number, status: number, api: string, StatusDesc): Observable<ResponseMessage> {
    this._apiEndpoint = api + id + "/Status/" + status;
    return this._http.post<ResponseMessage>(this._apiEndpoint, StatusDesc, httpOptions);
  }

  /**
   * Product
   * delete
   * @param code
   * @param icode
   * @param api
   * @returns
   */
  deleteProductData(code: string, icode: string, api: string): Observable<ResponseMessage> {
    this._apiEndpoint = api + "/" + code + "/" + icode;
    return this._http.delete<ResponseMessage>(this._apiEndpoint, httpOptions);
  }



  /**
  * Upload Document
  * @param api : API
  * @param File : Document Upload file
  * @returns
  */
  public uploadDoc(api: string, File: any): Observable<ResponseMessage> {
    let header = new HttpHeaders();
    header.append("Content-Type", "multipart/form-data");
    this._apiEndpoint = api;
    return this._http.post<ResponseMessage>(this._apiEndpoint, File, {
      headers: header,
    });
  }

  public UploadFile(api: string, file: File): Observable<ResponseMessage> {
    const formData = new FormData();
    formData.append("attachmentFile", file, file.name);
    this._apiEndpoint = api;
    return this._http.post<ResponseMessage>(this._apiEndpoint, formData);
  }





}
