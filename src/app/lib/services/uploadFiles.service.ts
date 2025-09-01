import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@config/api-endpoints.config';

@Injectable({
  providedIn: 'root'
})
export class UploadFilesService {

  private baseUrl = API_ENDPOINTS.Attachment.Upload;

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('attachmentFile', file);
    
    let header = new HttpHeaders();

    header.append("Content-Type", "multipart/form-data");

    const req = new HttpRequest('POST', `${this.baseUrl}`, formData, {
      headers: header,
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

//   getFiles(): Observable<any> {
//     return this.http.get(`${this.baseUrl}`);
//   }
}