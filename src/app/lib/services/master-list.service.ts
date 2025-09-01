import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import {
  IAdditionalFilterObject,
  IFilterRule,
  IQuerySpecs,
  OrderBySpecs,
  PagedList,
  QuerySpecs,
  ResponseMessage,
  gResponseMessage,
  operator,
} from '@models/common';
import { IBankDto } from '@models/dtos/core/BankDto';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { ICategoryDto } from '@models/dtos/core/CategoryDto';
import { ICityDto, ICityPincodeDto } from '@models/dtos/core/CityDto';
import { ICountryDto } from '@models/dtos/core/CountryDto';
import { ICustomerDto } from '@models/dtos/core/CustomerDto';
import { IDesignationDto } from '@models/dtos/core/DesignationDto';
import { IPinCodeDetails } from '@models/dtos/core/PinCodedto';
import { IProductPlanDto } from '@models/dtos/core/ProductPlanDto';
import { ISourceDto } from '@models/dtos/core/SourceDto';
import { IStateDto } from '@models/dtos/core/StateDto';
import { ISubSourceDto } from '@models/dtos/core/SubSourceDto';
import { ITeamReferenceDto } from '@models/dtos/core/TeamReferenceDto';
import {
  IVehicleModelDto,
  IVehicleTypeDto,
} from '@models/dtos/core/VehicleModelDto';
import { IVehicleSubModelDto } from '@models/dtos/core/VehicleSubModel';
import { IAgentDto } from '@models/dtos/core/agent-dto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { ISubCategoryDto } from '@models/dtos/core/subCategoryDto';
import { IUserDto } from '@models/dtos/core/userDto';
import {
  IVehicleBrandDto,
  VehicleBrandDto,
} from '@models/dtos/core/vehicleBrandDto';
import { IHdfcCustomerDetail } from '@models/dtos/motor-insurance/hdfc-motor/hdfc-customerDetails-dto';
import { IGroupHeadDto } from '@models/dtos/transaction-master/group-head.Dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterListService {
  private apiEndpoint: string;

  constructor(private _http: HttpClient) { }

  public getList(requestFor: string): Observable<ResponseMessage> {
    let ListType: String;
    requestFor = requestFor.toLowerCase();
    switch (requestFor) {
      case 'relation':
        ListType = 'Relation';
        break;
      case 'nomineerelation':
        ListType = 'NomineeRelation'
        break;
      case 'gender':
        ListType = 'Gender';
        break;

      case 'marital':
        ListType = 'Marital';
        break;

      case 'policyperiod':
        ListType = 'PolicyPeriod';
        break;

      case 'occupation':
        ListType = 'Occupation';
        break;

      case 'bajajallianzoccupation':
        ListType = 'BajajAllianzOccupation';
        break;

      case 'icicioccupation':
        ListType = 'ICICIOccupation';
        break;

      case 'careoccupation':
        ListType = 'CareOccupation';
        break;

      case 'paymentmode':
        ListType = 'PaymentMode';
        break;

      case 'documenttype':
        ListType = 'DocumentType';
        break;

      case 'policytype':
        ListType = 'PolicyType';
        break;

      case 'forkyc':
        ListType = 'ForKYC';
        break;

      case 'customertype':
        ListType = 'CustomerType';
        break;
      case 'staticgender':
        ListType = 'StaticGender';
        break;
      case 'HDFCFinancier':
        ListType = 'HDFCFinancier'
        break;
      default:
        ListType = '';
        break;
    }

    return this._http.post<ResponseMessage>(
      API_ENDPOINTS.ListHelper.List,
      {
        IncludeDeleted: false,
        PaginationSpecs: {
          PaginationRequired: false,
        },
        FilterConditions: {
          Condition: 'and',
          Rules: [
            {
              Field: 'InsuranceHelper.Type',
              Operator: 'eq',
              Value: ListType,
            },
          ],
        },
        OrderBySpecs: [],
        AdditionalFilters: [],
        DisplayColumns: [],
      },
      httpOptions
    );

  }

  public getCompanyWiseList(
    insurerName: string,
    requestFor: string
  ): Observable<ResponseMessage> {
    let ListType: String;
    requestFor = requestFor.toLowerCase();
    switch (requestFor) {
      case 'nomineerelation':
        ListType = 'NomineeRelation';
        break;
      case 'relation':
        ListType = 'Relation';
        break;
      case 'gender':
        ListType = 'Gender';
        break;

      case 'marital':
        ListType = 'Marital';
        break;

      case 'policyperiod':
        ListType = 'PolicyPeriod';
        break;

      case 'occupation':
        ListType = 'Occupation';
        break;

      case 'bajajallianzoccupation':
        ListType = 'BajajAllianzOccupation';
        break;

      case 'hdfcergooccupation':
        ListType = 'HDFCErgoOccupation';
        break;

      case 'adityabirlaoccupation':
        ListType = 'AdityaBirlaOccupation';
        break;

      case 'icicioccupation':
        ListType = 'ICICIOccupation';
        break;

      case 'careoccupation':
        ListType = 'CareOccupation';
        break;

      case 'paymentmode':
        ListType = 'PaymentMode';
        break;

      case 'documenttype':
        ListType = 'DocumentType';
        break;

      case 'policytype':
        ListType = 'PolicyType';
        break;

      case 'forkyc':
        ListType = 'ForKYC';
        break;

      case 'customertype':
        ListType = 'CustomerType';
        break;

      case 'zunofinanciername':
        ListType = 'ZunoFinancier';
        break;

      case 'zunooccupation':
        ListType = 'ZunoOccupation';
        break;

      case 'tataaiafinancier':
        ListType = 'TataAIAFinancier';
        break;

      case 'tataaiaoccupation':
        ListType = 'TataAIAOccupation';
        break;

      case 'tataaiapreinsurer':
        ListType = 'TataAIAPreInsurer';
        break;

      case 'hdfcergopreinsurer':
        ListType = 'HDFCErgoPreInsurer';
        break;

      case 'zunopreinsurer':
        ListType = 'ZunoPreInsurer';
        break;
      case 'appointeerelation':
        ListType = 'AppointeeRelation';
        break;
      case 'bajajallianzpreinsurer':
        ListType = 'BajajAllianzPreInsurer';
        break;
      case 'godigitpreinsurer':
        ListType = 'GoDigitPreInsurer';
        break;
      case 'hdfcneftbank':
        ListType = 'HDFCNEFTBank';
        break;

      default:
        ListType = '';
        break;
    }

    return this._http.post<ResponseMessage>(
      API_ENDPOINTS.ListHelper.List,
      {
        IncludeDeleted: false,
        PaginationSpecs: {
          PaginationRequired: false,
        },
        FilterConditions: {
          Condition: 'and',
          Rules: [
            {
              Field: 'InsuranceHelper.Type',
              Operator: 'eq',
              Value: ListType,
            },
            {
              Field: 'InsuranceCompanyCode',
              Operator: 'eq',
              Value: insurerName,
            },
          ],
        },
        OrderBySpecs: [
          {
            Field: "InsuranceHelper.SrNo",
            Direction: "asc"
          },
          {
            Field: 'InsuranceHelper.Name',
            Direction: "asc"
          }],
        AdditionalFilters: [],
        DisplayColumns: [],
      },
      httpOptions
    );
  }

  public getFilteredPincodeList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ICityPincodeDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Pincode.list;
    let querySpecs: IQuerySpecs = this._getFilter('PinCode', InputText);
    return this._http.post<gResponseMessage<PagedList<ICityPincodeDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredPincodeListWithDetails(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IPinCodeDetails>>> {
    this.apiEndpoint = API_ENDPOINTS.Pincode.list;
    let querySpecs: IQuerySpecs = this._getFilter('PinCode', InputText);
    return this._http.post<gResponseMessage<PagedList<IPinCodeDetails>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredDesignationList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IDesignationDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Designation.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IDesignationDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredCompanyNameList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IInsuranceCompanyDto>>> {
    this.apiEndpoint = API_ENDPOINTS.InsuranceCompany.list;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IInsuranceCompanyDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getAllCompanyNameList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IInsuranceCompanyDto>>> {
    this.apiEndpoint = API_ENDPOINTS.InsuranceCompany.list;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    querySpecs.PaginationSpecs.PaginationRequired = false;
    return this._http.post<gResponseMessage<PagedList<IInsuranceCompanyDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredUserList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IUserDto>>> {
    this.apiEndpoint = API_ENDPOINTS.User.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IUserDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredFinancierNameList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<any>>> {
    this.apiEndpoint = API_ENDPOINTS.ListHelper.List;
    let querySpecs: IQuerySpecs = this._getFilter('InsuranceHelper.Name', InputText);
    querySpecs.FilterConditions.Rules.push({
      "Field": "InsuranceHelper.Type",
      "Operator": "eq",
      "Value": "HDFCFinancier"
    })
    return this._http.post<gResponseMessage<PagedList<any>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }


  /**
   *  Get Master Data With Multi Filter Condition
   * @param apiEndpoint
   * @param field
   * @param InputText
   * @param rules
   * @returns
   */
  public getFilteredMultiRulMasterDataList(apiEndpoint: string, field: string, InputText: string, rules: IFilterRule[] = [],
    AdditionalFilters: IAdditionalFilterObject[] = [],
    OrderBySpecs: OrderBySpecs[] = [],
    operator: any = "contains"
  ): Observable<gResponseMessage<PagedList<any>>> {
    this.apiEndpoint = apiEndpoint;
    let querySpecs: IQuerySpecs = this._getFilterWithMultiRule(field, InputText, rules, AdditionalFilters, OrderBySpecs, operator);
    return this._http.post<gResponseMessage<PagedList<any>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredAgentList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IAgentDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Agent.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IAgentDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredReportingManagerList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IUserDto>>> {
    this.apiEndpoint = API_ENDPOINTS.User.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IUserDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredSourceList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ISourceDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Source.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<ISourceDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredGroupHeadList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IGroupHeadDto>>> {
    this.apiEndpoint = API_ENDPOINTS.GroupHead.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IGroupHeadDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredSubSourceList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ISubSourceDto>>> {
    this.apiEndpoint = API_ENDPOINTS.SubSource.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<ISubSourceDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredBankList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IBankDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Bank.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IBankDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredReferenceList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IAgentDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Agent.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IAgentDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredBranchList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IBranchDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Branch.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IBranchDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredCREList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IUserDto>>> {
    this.apiEndpoint = API_ENDPOINTS.User.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IUserDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredCRMList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IUserDto>>> {
    this.apiEndpoint = API_ENDPOINTS.User.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IUserDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredVerticalHeadList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IUserDto>>> {
    this.apiEndpoint = API_ENDPOINTS.User.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IUserDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredRecruitingPersonList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IUserDto>>> {
    this.apiEndpoint = API_ENDPOINTS.User.List;
    let querySpecs: IQuerySpecs = this._getFilter('FirstName', InputText);
    return this._http.post<gResponseMessage<PagedList<IUserDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredCountryList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ICountryDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Country.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<ICountryDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }
  public getFilteredCityList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ICityDto>>> {
    this.apiEndpoint = API_ENDPOINTS.City.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<ICityDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }
  public getFilteredVehilceBrandList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IVehicleBrandDto>>> {
    this.apiEndpoint = API_ENDPOINTS.VehicleBrand.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IVehicleBrandDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getAllVehilceBrandList(
    vehicleType: string
  ): Observable<gResponseMessage<PagedList<IVehicleBrandDto>>> {
    this.apiEndpoint = API_ENDPOINTS.VehicleBrand.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', "");
    querySpecs.PaginationSpecs.PaginationRequired = false;
    if (vehicleType != '') {
      let filterValues = [];
      filterValues.push(vehicleType)
      querySpecs.AdditionalFilters.push({
        key: "VehicleType",
        filterValues: filterValues
      })
    }

    return this._http.post<gResponseMessage<PagedList<IVehicleBrandDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  /**
   * in this two different type of querySpecs is passed depending on the availabe data
   * @param InputText : value of Name
   * @param FieldName : name of the field depending on which list is to be filtered
   * @param Value : value of FieldName
   * @param Operator : operator for FieldName
   * @returns : Returns list
   */
  public getFilteredVehilceModelList(InputText: string, FieldName?: string, Value?: string, Operator?): Observable<gResponseMessage<PagedList<IVehicleModelDto>>> {
    this.apiEndpoint = API_ENDPOINTS.VehicleModel.List;
    let querySpecs: IQuerySpecs
    if (FieldName) {
      querySpecs = this._getFilterByField('Name', InputText, FieldName, Value, Operator);
    }
    else {
      querySpecs = this._getFilter('Name', InputText);
    }
    return this._http.post<gResponseMessage<PagedList<IVehicleModelDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  /**
   * in this two different type of querySpecs is passed depending on the availabe data
   * @param InputText : value of Name
   * @param FieldName : name of the field depending on which list is to be filtered
   * @param Value : value of FieldName
   * @param Operator : operator for FieldName
   * @returns : Returns list
   */
  public getFilteredVehilceSubModelList(InputText: string, FieldName?: string, Value?: string, Operator?): Observable<gResponseMessage<PagedList<IVehicleSubModelDto>>> {
    this.apiEndpoint = API_ENDPOINTS.VehicleSubModel.List;
    let querySpecs: IQuerySpecs
    if (FieldName) {
      querySpecs = this._getFilterByField('Name', InputText, FieldName, Value, Operator);
    }
    else {
      querySpecs = this._getFilter('Name', InputText);
    }
    return this._http.post<gResponseMessage<PagedList<IVehicleSubModelDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  /**
   * in this two different type of querySpecs is passed depending on the availabe data
   * @param InputText : value of Name
   * @param FieldName : name of the field depending on which list is to be filtered
   * @param Value : value of FieldName
   * @param Operator : operator for FieldName
   * @returns : Returns list
   */
  public getFilteredCustomerList(InputText: string, FieldName?: string, Value?: string, Operator?): Observable<gResponseMessage<PagedList<ICustomerDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Customer.List;
    let querySpecs: IQuerySpecs
    if (FieldName) {
      querySpecs = this._getFilterByField('FirstName', InputText, FieldName, Value, Operator);
    }
    else {
      querySpecs = this._getFilter('FirstName', InputText);
    }
    return this._http.post<gResponseMessage<PagedList<ICustomerDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredStateList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<IStateDto>>> {
    this.apiEndpoint = API_ENDPOINTS.State.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<IStateDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  /**
   * in this two different type of querySpecs is passed depending on the availabe data
   * @param InputText : value of Name
   * @param FieldName : name of the field depending on which list is to be filtered
   * @param Value : value of FieldName
   * @param Operator : operator for FieldName
   * @returns : Returns list
   */
  public getFilteredProductPlanList(InputText: string, FieldName?: string, Value?: string, Operator?): Observable<gResponseMessage<PagedList<IProductPlanDto>>> {
    this.apiEndpoint = API_ENDPOINTS.ProductPlan.List;
    let querySpecs: IQuerySpecs
    if (FieldName) {
      querySpecs = this._getFilterByField('Name', InputText, FieldName, Value, Operator);
    }
    else {
      querySpecs = this._getFilter('Name', InputText);
    }
    return this._http.post<gResponseMessage<PagedList<IProductPlanDto>>>(this.apiEndpoint, querySpecs, httpOptions);
  }

  public getFilteredCategoryList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ICategoryDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Category.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    return this._http.post<gResponseMessage<PagedList<ICategoryDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getAllCategoryList(
    InputText: string
  ): Observable<gResponseMessage<PagedList<ICategoryDto>>> {
    this.apiEndpoint = API_ENDPOINTS.Category.List;
    let querySpecs: IQuerySpecs = this._getFilter('Name', InputText);
    querySpecs.PaginationSpecs.PaginationRequired = false;
    return this._http.post<gResponseMessage<PagedList<ICategoryDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getFilteredSubCategoryList(InputText: string, FieldName?: string, Value?: string, Operator?): Observable<gResponseMessage<PagedList<ISubCategoryDto>>> {
    this.apiEndpoint = API_ENDPOINTS.SubCategory.List;
    let querySpecs: IQuerySpecs
    if (FieldName) {
      querySpecs = this._getFilterByField('Name', InputText, FieldName, Value, Operator);
    }
    else {
      querySpecs = this._getFilter('Name', InputText);
    }
    return this._http.post<gResponseMessage<PagedList<ISubCategoryDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }

  public getAllSubCategoryList(InputText: string, FieldName?: string, Value?: string, Operator?): Observable<gResponseMessage<PagedList<ISubCategoryDto>>> {
    this.apiEndpoint = API_ENDPOINTS.SubCategory.List;
    let querySpecs: IQuerySpecs
    if (FieldName) {
      querySpecs = this._getFilterByField('Name', InputText, FieldName, Value, Operator);
    }
    else {
      querySpecs = this._getFilter('Name', InputText);
    }
    querySpecs.PaginationSpecs.PaginationRequired = false;
    return this._http.post<gResponseMessage<PagedList<ISubCategoryDto>>>(
      this.apiEndpoint,
      querySpecs,
      httpOptions
    );
  }


  // List Query Specs
  private _getFilterWithMultiRule(
    fieldName: string,
    value: any,
    rules: IFilterRule[] = [],
    AdditionalFilters: IAdditionalFilterObject[] = [],
    orderSpecs: OrderBySpecs[],
    operator: any
  ): IQuerySpecs {

    let specs = new QuerySpecs();
    specs.PaginationSpecs.PaginationRequired = false;


    /**
     * Deafult Filter Condition
     */
    specs.FilterConditions.Rules = rules
    specs.AdditionalFilters = AdditionalFilters


    if (fieldName) {
      // if ((value.length == 1 && value === "%") || value.length == 0) {
      //   operator = "contains";
      //   value = "";
      // } else {
      //   operator = operator;
      // }

      let rule = {
        Field: fieldName,
        Operator: operator,
        Value: value,
      }

      let orderBySpecs = new OrderBySpecs();

      if (orderSpecs.length == 0) {
        orderBySpecs = {
          field: fieldName,
          direction: 'asc'
        }
        specs.OrderBySpecs = [orderBySpecs]
      }
      else {
        // orderBySpecs = {
        //   field: orderSpecs[0].field,
        //   direction: orderSpecs[0].direction
        // }
        specs.OrderBySpecs = orderSpecs

      }



      //Mange Already Exsting Rule Update value
      if (specs.FilterConditions.Rules) {
        let i = specs.FilterConditions.Rules.findIndex((f) => f.Field === rule.Field);
        if (i >= 0) {
          specs.FilterConditions.Rules[i] = rule;
        } else {
          specs.FilterConditions.Rules.push(rule);
        }
      }

      //Mange Already Exsting OrderBySpecs Update value
      // if (specs.OrderBySpecs) {
      //   let i = specs.OrderBySpecs.findIndex((f) => f.field === orderBySpecs.field);
      //   if (i >= 0) {
      //     specs.OrderBySpecs.push(orderBySpecs);
      //   } else {
      //     specs.OrderBySpecs.push(orderBySpecs);
      //   }
      // }



    }

    return specs;
  }



  private _getFilter(Key: string, inputtext: string): IQuerySpecs {
    return {
      PaginationSpecs: {
        PaginationRequired: true,
        Page: 1,
        Limit: 100,
      },
      FilterConditions: {
        Condition: 'and',
        Rules: [
          {
            Field: Key,
            Value: inputtext,
            Operator: 'contains',
          },
        ],
      },
      OrderBySpecs: [
        {
          field: Key,
          direction: "asc"
        }
      ],
      AdditionalFilters: [],
      IncludeDeleted: false,
    };
  }

  /**
   * when list is to be filtered depending on the value of another field in the table [when list is filtered by parameters of two fields]
   * @param FieldName : name of the field depending on which the list is filtered
   * @param FieldValue : value of the depending field
   * @param Key : name of the field
   * @param inputtext : input of the field
   * @returns : returns data
   */
  private _getFilterByField(Key: string, inputtext: string, FieldName: string, FieldValue: string, FieldOperator: operator = 'contains'): IQuerySpecs {
    return {
      PaginationSpecs: {
        PaginationRequired: true,
        Page: 1,
        Limit: 100,
      },
      FilterConditions: {
        Condition: 'and',
        Rules: [
          {
            Field: FieldName,
            Value: FieldValue,
            Operator: FieldOperator,
          },
          {
            Field: Key,
            Value: inputtext,
            Operator: 'contains',
          },
        ],
      },
      OrderBySpecs: [],
      AdditionalFilters: [],
      IncludeDeleted: false,
    };
  }
}
