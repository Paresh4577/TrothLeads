import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { HttpService } from '@lib/services/http/http.service';
import { of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollBarMessageResolverService {

  constructor(private httpService: HttpService) { }

  resolve(): any {

    let api = API_ENDPOINTS.ScrollBarMessage.Base;
    return this.httpService
      .getDataByAPI(api)
      .pipe(switchMap((res) => (res.Success ? of(res.Data) : throwError(res.Message))));
  }
}
