import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { AppError, IQuerySpecs, PagedList, ResourceDto, gResponseMessage } from '@models/common';
import { RoleDto } from '@models/dtos/auth/role-dto';
import { RoleFeatureDto } from '@models/dtos/auth/role-feature-dto';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
// Private
private apiEndpoint: string;
private appError: AppError;

constructor(private http: HttpClient) {}

public get(id: number): Observable<gResponseMessage<RoleDto>> {
  this.apiEndpoint = API_ENDPOINTS.Role.Base + "/" + id;
  return this.http.get<gResponseMessage<RoleDto>>(this.apiEndpoint, httpOptions);
}

public getList(specs: IQuerySpecs): Observable<gResponseMessage<PagedList<RoleDto>>> {
  this.apiEndpoint = API_ENDPOINTS.Role.List;
  return this.http.post<gResponseMessage<PagedList<RoleDto>>>(this.apiEndpoint, specs, httpOptions);
}

public update(role: RoleDto): Observable<gResponseMessage<ResourceDto>> {
  if (!this._validateRole(role)) {
    return throwError(this.appError);
  }
  this.apiEndpoint = API_ENDPOINTS.Role.Base;

  return this.http.put<gResponseMessage<ResourceDto>>(this.apiEndpoint, role, httpOptions);
}

public add(role: RoleDto): Observable<gResponseMessage<ResourceDto>> {
  if (!this._validateRole(role)) {
    return throwError(this.appError);
  }

  this.apiEndpoint = API_ENDPOINTS.Role.Base;

  return this.http.post<gResponseMessage<ResourceDto>>(this.apiEndpoint, role, httpOptions);
}

public delete(id: string): Observable<gResponseMessage<ResourceDto>> {
  this.apiEndpoint = API_ENDPOINTS.Role.Base + "/" + id;

  return this.http.delete<gResponseMessage<ResourceDto>>(this.apiEndpoint, httpOptions);
}

public updateRoleActivity(roleFeature: RoleFeatureDto[]): Observable<gResponseMessage<ResourceDto>> {
  this.apiEndpoint = API_ENDPOINTS.RoleFeature.put;
  return this.http.put<gResponseMessage<ResourceDto>>(this.apiEndpoint, roleFeature, httpOptions);
}

// get Role By Id With All Feature-List
public getFeatureList(id: number): Observable<gResponseMessage<RoleDto>>{
  this.apiEndpoint = API_ENDPOINTS.RoleFeature.list +"/" + id
  return this.http.get<gResponseMessage<RoleDto>>(this.apiEndpoint,httpOptions)
}
//Private methods
private _validateRole(role: RoleDto): boolean {
  return true;
}
}
