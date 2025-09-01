import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RFQConvertResolverService {

    constructor(private httpService: HttpService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router): any {
        
        let id = route.params['Id'];
        let param1 = route.params['SubCategoryCode'];
        let api = route.data['apiEndPoint'];
        api = api.replace("{id}", id.toString()) // replace id

        if (param1 != "" && param1 != null && param1 != undefined) {
            api = api.replace("{SubCategoryCode}", param1.toString()) // replace subcategory code
        }

        if (id) {
            return this.httpService
                .getDataByAPI(api)
                .pipe(switchMap((res) => (res.Success ? of(res.Data) : throwError(`Id ${id} not found`))));
        }
    }
}
