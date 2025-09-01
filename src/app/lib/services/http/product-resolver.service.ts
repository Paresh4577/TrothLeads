import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { HttpService } from './http.service';
import { of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductResolverService {

  constructor(private httpService: HttpService) { }

  resolve(route: ActivatedRouteSnapshot):any{
    let Code = route.params['Code'];
    let InsurerCode = route.params['InsurerCode'];
    let api = route.data['apiEndPoint'];

    if (Code) {
      return this.httpService
        .getDataByCode(Code, InsurerCode, api)
        .pipe(switchMap((res) => (res.Success ? of(res.Data) : throwError(`Code ${Code} not found`))));
    }
  }
}
