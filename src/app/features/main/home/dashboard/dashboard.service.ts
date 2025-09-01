import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private _http: HttpClient) { }

    public getPendingMyRequest(): Observable<any> {
        let API = API_ENDPOINTS.Dashboard.MyPendingRequest;
        return this._http.get<any>(API);
    }

}