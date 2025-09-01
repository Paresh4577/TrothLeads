import { Injectable } from '@angular/core';
import { RoleService } from './role.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { AppError } from '@models/common';
import { RoleDto } from '@models/dtos/auth/role-dto';

@Injectable({
  providedIn: 'root'
})
export class RoleResolverService {
  constructor(private dataService: RoleService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RoleDto> {
    let id = route.params['Id'];
    
    return this.dataService
      .getFeatureList(id)
      .pipe(switchMap((res) => 
      (res.Success ? of(res.Data) : throwError(new AppError(`Role Id ${id} not found`)))
      ));
  }
}
