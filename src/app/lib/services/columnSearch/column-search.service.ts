import { Injectable } from '@angular/core';
import {
  FilterConditions,
  IAdditionalFilterObject,
  IFilterConditions,
  IFilterRule,
  IPaginationSpecs,
  OrderBySpecs,
  PaginationSpecs,
  operator,
} from '@models/common';

@Injectable({
  providedIn: 'root',
})
export class ColumnSearchService {
  public IncludeDeleted: boolean = false;
  public FilterConditions?: IFilterConditions = new FilterConditions();
  public OrderBySpecs?: OrderBySpecs[] = [];
  public AdditionalFilters?: IAdditionalFilterObject[] = [];
  public DisplayColumns: string[] = [];

  constructor() {
    this.IncludeDeleted = false;
    this.FilterConditions = new FilterConditions();
    this.FilterConditions.Rules = [];
    this.OrderBySpecs = [];
    this.AdditionalFilters = [];
    this.DisplayColumns = [];
  }

  public UpdateFilter(value: any, valuetype: string = 'text') {
    if (value.isAdditional && value.isAdditional == true) {
      if (value.searchValue !=null && value.searchValue !='') {
        let additionalFilters: IAdditionalFilterObject = {
          key: value.field,
          filterValues: [value.searchValue],
        };
  
        let i = this.AdditionalFilters.findIndex(
          (f) => f.key === additionalFilters.key
        );
  
        if (i >= 0) {
          this.AdditionalFilters[i] = additionalFilters;
        } else {
          this.AdditionalFilters.push(additionalFilters);
        }
      } else {
        let indexNumber: number = this.AdditionalFilters.findIndex(item => item.key === value.field);
        if (indexNumber !== -1) {
          this.AdditionalFilters.splice(indexNumber, 1);
        }
      }
      
    } else {
      let operatorVal;
      if (value.operator == '') {
        operatorVal = 'contains';
      } else {
        operatorVal = value.operator;
      }
      let rule: IFilterRule = {
        Field: value.field,
        Operator: operatorVal,
        Value: value.searchValue,
      };

      if (!this.FilterConditions) {
        this.FilterConditions = new FilterConditions();
        this.FilterConditions.Rules = [];
      }

      if (this.FilterConditions.Rules) {
        let i = this.FilterConditions.Rules.findIndex(
          (f) => f.Field == rule.Field
        );
        if (i >= 0) {
          if (valuetype == 'date') {
            this.AddDateRule(value);
          }
          else {
            this.FilterConditions.Rules[i] = rule;
          }

        } else {
          if (valuetype == 'date') {
            this.AddDateRule(value);
          }
          else {
            this.FilterConditions.Rules.push(rule);
          }
        }
      }
    }
  }

  private AddDateRule(value: any, IsNew: boolean = false) {

    if (!IsNew) {
      let FirstIndex: number = this.FilterConditions.Rules.findIndex(item => item.Operator === 'gte' && item.Field == value.field);

      if (FirstIndex !== -1) {
        this.FilterConditions.Rules.splice(FirstIndex, 1);
      }

      let SecondIndex: number = this.FilterConditions.Rules.findIndex(item => item.Operator === 'lte' && item.Field == value.field);

      if (SecondIndex !== -1) {
        this.FilterConditions.Rules.splice(SecondIndex, 1);
      }
    }

    if (value.searchValue != '') {
      let lterule: IFilterRule = {
        Field: value.field,
        Operator: 'lte',
        Value: value.searchValue + 'T23:59:59.000'
      };
  
      let gterule: IFilterRule = {
        Field: value.field,
        Operator: 'gte',
        Value: value.searchValue + 'T00:00:00.000',
      };

      this.FilterConditions.Rules.push(lterule);
      this.FilterConditions.Rules.push(gterule);
    }
    else {
      let lterule: IFilterRule = {
        Field: value.field,
        Operator: 'lte',
        Value: value.searchValue
      };
  
      let gterule: IFilterRule = {
        Field: value.field,
        Operator: 'gte',
        Value: value.searchValue,
      };
      
      this.FilterConditions.Rules.push(lterule);
      this.FilterConditions.Rules.push(gterule);
    }
    

    
  }
  public UpdateSort(column: string) {
    /*
    export class OrderBySpecs {
  field: string;
  direction?: "asc" | "desc" | "" = "asc";
}
 */

    let i = this.OrderBySpecs.findIndex((f) => f.field === column);

    if (i >= 0) {
      let selectedDirection = this.OrderBySpecs[i].direction;
      if (selectedDirection == 'asc') selectedDirection = 'desc';
      else selectedDirection = 'asc';
      this.OrderBySpecs[i].direction = selectedDirection;
    } else {
      let orderBy: OrderBySpecs = {
        field: column,
        direction: 'asc',
      };
      this.OrderBySpecs = [orderBy];
    }
  }
}
