import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { ResponseMessage } from '@models/common';
import { CategoryCodeEnum } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root'
})
export class TransactionEntryService {

  pagefilters = {
    currentPage: 1
  }
  constructor(private _http: HttpClient,
    private _dataService: HttpService,
    private _column: ColumnSearchService) { }

  /**
   * to create transaction
   * @param CategoryName : name of the category based on which end point of api will be determined
   * @param body : object that is be submited
   * @returns
   */
  public pCarTransaction(CategoryCode, body) {
    let api
    if (CategoryCode == CategoryCodeEnum.Motor) {
      api = API_ENDPOINTS.OfflineTransaction.Motor
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {
      api = API_ENDPOINTS.OfflineTransaction.Health
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {
      api = API_ENDPOINTS.OfflineTransaction.Fire
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering) {
      api = API_ENDPOINTS.OfflineTransaction.Engineering
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {
      api = API_ENDPOINTS.OfflineTransaction.PersonalAccident
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {
      api = API_ENDPOINTS.OfflineTransaction.Travel
    }
    else if (CategoryCode == CategoryCodeEnum.Miscellaneous) {
      api = API_ENDPOINTS.OfflineTransaction.Miscellaneous
    }
    else if (CategoryCode == CategoryCodeEnum.Liability) {
      api = API_ENDPOINTS.OfflineTransaction.Liability
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {
      api = API_ENDPOINTS.OfflineTransaction.Package
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {
      api = API_ENDPOINTS.OfflineTransaction.LifeInsurance
    }
    else if (CategoryCode == CategoryCodeEnum.WorkmenComp) {
      api = API_ENDPOINTS.OfflineTransaction.WorkmenCompensation
    }
    else if (CategoryCode == CategoryCodeEnum.Marine) {
      api = API_ENDPOINTS.OfflineTransaction.Marine
    }
    else if (CategoryCode == CategoryCodeEnum.Group) {
      api = API_ENDPOINTS.OfflineTransaction.Group
    }
    return this._http.post<ResponseMessage>(api, body, httpOptions)
  }

  /**
   * to update existing transaction
   * @param CategoryName : name of the category based on which end point of api will be determined
   * @param body : object that is be submited
   * @returns
   */
  public pCarTransactionUpdate(CategoryCode, body) {
    let api
    if (CategoryCode == CategoryCodeEnum.Motor) {
      api = API_ENDPOINTS.OfflineTransaction.Motor
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {
      api = API_ENDPOINTS.OfflineTransaction.Health
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {
      api = API_ENDPOINTS.OfflineTransaction.Fire
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering) {
      api = API_ENDPOINTS.OfflineTransaction.Engineering
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {
      api = API_ENDPOINTS.OfflineTransaction.PersonalAccident
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {
      api = API_ENDPOINTS.OfflineTransaction.Travel
    }
    else if (CategoryCode == CategoryCodeEnum.Miscellaneous) {
      api = API_ENDPOINTS.OfflineTransaction.Miscellaneous
    }
    else if (CategoryCode == CategoryCodeEnum.Liability) {
      api = API_ENDPOINTS.OfflineTransaction.Liability
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {
      api = API_ENDPOINTS.OfflineTransaction.Package
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {
      api = API_ENDPOINTS.OfflineTransaction.LifeInsurance
    }
    else if (CategoryCode == CategoryCodeEnum.WorkmenComp) {
      api = API_ENDPOINTS.OfflineTransaction.WorkmenCompensation
    }
    else if (CategoryCode == CategoryCodeEnum.Marine) {
      api = API_ENDPOINTS.OfflineTransaction.Marine
    }
    else if (CategoryCode == CategoryCodeEnum.Group) {
      api = API_ENDPOINTS.OfflineTransaction.Group
    }
    return this._http.put<ResponseMessage>(api, body, httpOptions)
  }


  public getDataListCoShare(querySpec: any, api: string) {
    return this._http.post<any>(api, querySpec, httpOptions);
  }

  /**
   *
   * @param api : API
   * @returns : returns data of API
   */
  public _loadListsWithResponse(api) {
    let listArray = []
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [];
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
              if (api == API_ENDPOINTS.Category.Base) {
                if (element.Status == 1)
                  listArray.push(element);
              }
              else {
                listArray.push(element);
              }
            })
            
          }
        },
      );

    return listArray
  }
}
