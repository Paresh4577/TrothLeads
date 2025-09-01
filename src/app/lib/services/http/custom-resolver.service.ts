import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomResolverService {

  constructor(private httpService: HttpService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router): any {
    let id = route.params['Id'];
    let api = route.data['apiEndPoint'];
    api = api.replace("{id}", id.toString()) // replace id

    if (id) {
      return this.httpService
        .getDataByAPI(api)
        .pipe(switchMap((res) => (res.Success ? of(res.Data) : throwError(`Id ${id} not found`))));
    }
  }
}
