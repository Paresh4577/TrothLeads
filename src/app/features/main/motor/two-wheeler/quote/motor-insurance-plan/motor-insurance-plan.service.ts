import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { ResponseMessage } from '@models/common';
import { IVehicleDetailsDto } from '@models/dtos/config/Vehicle/vehicle-details-dto';

@Injectable({
  providedIn: 'root'
})
export class MotorInsurancePlanService {

  pagefilters = {
    currentPage: 1
  }

  constructor(private _http: HttpClient, private _dataService: HttpService,
    private _column: ColumnSearchService) { }

  public vehicleDetails(body: IVehicleDetailsDto) {
    let API = API_ENDPOINTS.Motor.VehicleDetail
    return this._http.post<ResponseMessage>(API, body, httpOptions)
  }

  /**
   * 
   * @param api : API 
   * @returns : returns data of API
   */
  public _loadListsWithResponse(api) {
    let listArray = []
    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: false,
        Page: this.pagefilters.currentPage,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    this._dataService
      .getDataList(listRequestBody, api).subscribe(
        (res) => {
          if (res.Success) {
            res.Data.Items.forEach((element) => {
              listArray.push(element);
            })

          }
        },
      );

    return listArray
  }

  /**
  * 
  * @param api : API
  * @returns  : 
  */
  public _loadLists(api) {
    // let listArray =[]
    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: false,
        Page: this.pagefilters.currentPage,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    return this._dataService.getDataList(listRequestBody, api)
  }
}
