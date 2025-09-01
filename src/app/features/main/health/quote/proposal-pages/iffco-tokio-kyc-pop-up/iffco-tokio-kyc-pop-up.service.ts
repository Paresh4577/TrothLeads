import { HttpClient , HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResponseMessage } from '@models/common/responseMessage';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class IffcoTokioKycPopUpService {
  constructor(private _httpClient: HttpClient) {}

  
  public submit(formValue,file1 : File,file2 : File,file3:File): Observable<any> {
    const formData: FormData = new FormData();
     for (let i in formValue) {
      if (i == 'KYCDocuments') {
        continue
      } else {
        formData.append(i, `${formValue[i]}`)
      }
      
     }
   
     formData.append('KYCDocuments[0].IdAttachment', file1);
     formData.append('KYCDocuments[1].IdAttachment', file2);
     formData.append('KYCDocuments[2].IdAttachment', file3);
     
     let header = new HttpHeaders();
 
     header.append("Content-Type", "multipart/form-data");
    

    const req = new HttpRequest('POST', API_ENDPOINTS.IFFCO_TOKIO.KYC, formData, {
      headers: header,
      reportProgress: true,
      responseType: 'json'
    });

    return this._httpClient.request<ResponseMessage>(req);

  }
}
