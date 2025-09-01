import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { AddOnsDto, IAddOnsDto } from '@models/dtos/config/add-ons';
import { PlanNameEnum } from 'src/app/shared/enums/PlanNames.enum';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';

@Injectable({
  providedIn: 'root'
})
export class AddOnService {

  constructor(private _http: HttpClient) { }

  createAddOn(body:any,API:string) {

    return this._http.post<any>(API, body, httpOptions)
  }

  getAddOns(Plan:string,Name?:string) :IAddOnsDto[] {

    let AddOns:IAddOnsDto[] = new Array<AddOnsDto>();

    let AddOn :IAddOnsDto;

    if (Plan==InsuranceCompanyName.Care) {
      if (Name==PlanNameEnum.careAdvantage) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Care Shield',
        AddOn.Value = 'CARESHILED1104',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Smart Select',
        AddOn.Value = 'SMARTCA',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Room Rent Modification',
        AddOn.Value = 'RRMCA',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Air Ambulance Cover',
        AddOn.Value = 'AACCA1090',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Waiver of Co-Payment',
        AddOn.Value = 'COPAYWAIVER1103',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Ext of Global Coverage (Inc US)',
        AddOn.Value = 'EXTOFGIU',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Reduction in PED',
        AddOn.Value = 'RIPEDCA1092',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Annual Health Check-Up',
        AddOn.Value = 'HCUPCA1093',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careAdvantage,
        AddOn.AddOn = 'Co-Payment',
        AddOn.Value = 'COPAY1194',
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)
      }

      if (Name==PlanNameEnum.careHeart) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careHeart,
        AddOn.AddOn = 'Care Shield',
        AddOn.Value = 'CARESHILEDCF1209'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careHeart,
        AddOn.AddOn = 'Home Care',
        AddOn.Value = 'CFWHC'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)
      }

      if (Name==PlanNameEnum.careFreedom) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careFreedom,
        AddOn.AddOn = 'Care Shield',
        AddOn.Value = 'CARESHILEDCF1209'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careFreedom,
        AddOn.AddOn = 'Health Check Plus',
        AddOn.Value = 'CFHP'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careFreedom,
        AddOn.AddOn = 'Deductible',
        AddOn.Value = 'CAREFREEDOMDEDUCTIBLERIDER25000'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)
      }

      if (Name==PlanNameEnum.carePlusYouth || Name==PlanNameEnum.carePlusComplete) {
        AddOn = new AddOnsDto()
        AddOn.Plan = Name,
        AddOn.AddOn = 'Smart Select',
        AddOn.Value = 'SSCP1113',
        AddOn.Description = 'Care Plus - Youth Plan and Care Plus - Complete Plan '
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = Name,
        AddOn.AddOn = 'International Second opinion',
        AddOn.Value = 'ISOCP1112',
        AddOn.Description = 'Care Plus - Youth Plan and Care Plus - Complete Plan '
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        if (Name==PlanNameEnum.carePlusYouth) {
          AddOn = new AddOnsDto()
          AddOn.Plan = Name,
          AddOn.AddOn = 'Maternity',
          AddOn.Value = 'MCCP1111',
          AddOn.Description = 'Care Plus - Youth Plan'
          AddOn.Function = 'Care',
          AddOn.Answer = false,

          AddOns.push(AddOn)
        }

      }

      if (Name==PlanNameEnum.careSupreme) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'Annual Health Check-up',
        AddOn.Value = 'AHCS1144'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'NCB Super',
        AddOn.Value = 'NCBS1145'
        AddOn.Function = 'Care',
        AddOn.Answer = false,
        AddOn.Dropdown = false

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'Claim Shield',
        AddOn.Value = 'CS1154'
        AddOn.Function = 'Care',
        AddOn.Answer = false,
        AddOn.Dropdown = false

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'Instant Cover',
        AddOn.Value = 'ICS1149'
        AddOn.Function = 'Care',
        AddOn.Answer = false,
        AddOn.Dropdown = false

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'Reduction in PDE',
        AddOn.Value = 'PEDWP1Y1155'
        AddOn.Function = 'Care',
        AddOn.Answer = false,
        AddOn.Dropdown = true,
        AddOn.OptionArray = [{'name':'1 Year' , 'value':'PEDWP1Y1155'} , {'name':'2 Year' , 'value':'PEDWP2Y1156'} , {'name':'3 Year' , 'value':'PEDWP3Y1157'}]
        AddOn.DropdownName = 'Reduction'
        AddOn.Icon = 'perm_contact_calendar'

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'OPD Care',
        AddOn.Value = 'COPD1211'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSupreme,
        AddOn.AddOn = 'Be-Fit Benefit',
        AddOn.Value = 'BFS1148'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

          AddOns.push(AddOn)
      }

      if (Name==PlanNameEnum.careSenior) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSenior,
        AddOn.AddOn = 'Care Shield',
        AddOn.Value = 'CARESHILED1104'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSenior,
        AddOn.AddOn = 'Co-payment',
        AddOn.Value = 'COPAYWAIVER1103'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSenior,
        AddOn.AddOn = 'Smart Select',
        AddOn.Value = 'SMART'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSenior,
        AddOn.AddOn = 'NCB-Super',
        AddOn.Value = 'CAREWITHNCB'
        AddOn.Function = 'Care',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.careSenior,
        AddOn.AddOn = 'OPD Care',
        AddOn.Value = 'OPDCARE'
        AddOn.Function = 'Care',
        AddOn.Answer = false,
        AddOn.Dropdown = true,
        AddOn.OptionArray = [{'name':'5000' , 'value':'5000'} , {'name':'10000' , 'value':'10000'} , {'name':'15000' , 'value':'15000'} ,
                             {'name':'20000' , 'value':'20000'}, {'name':'25000' , 'value':'25000'} , {'name':'30000' , 'value':'30000'} ,
                             {'name':'35000' , 'value':'35000'} , {'name':'40000' , 'value':'40000'}, {'name':'45000' , 'value':'45000'} ,
                             {'name':'50000' , 'value':'50000'}]
        AddOn.DropdownName = 'OPDCARESI'
        AddOn.Icon = '₹'

        AddOns.push(AddOn)
      }

    }

    if (Plan==InsuranceCompanyName.IffcoTokio) {
      
      // if (Name==PlanNameEnum.IffcoTokio_Health_Protection_Individual) {

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.IffcoTokio_Health_Protection_Individual,
        AddOn.AddOn = 'Critical Illness',
        AddOn.Value = 'CriticalIllnessCovered',
        AddOn.Function = 'IffcoTokio',
        AddOn.Answer = false,
        AddOn.InputType = 'input',
        AddOn.Icon = 'coronavirus'
        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.IffcoTokio_Health_Protection_Individual,
        AddOn.AddOn = 'Room Rent Waiver',
        AddOn.Value = 'RoomRentWaiver'
        AddOn.Function = 'IffcoTokio',
        AddOn.Answer = false,
        AddOn.InputType = 'input',
        AddOn.Icon = 'bedroom_parent'
        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.IffcoTokio_Health_Protection_Individual,
        AddOn.AddOn = 'Customer has any other iffco-tokio  policy',
        AddOn.Value = 'IffcoTokioPolicy'
        AddOn.Function = 'IffcoTokio',
        AddOn.Answer = false,
        AddOn.InputType = 'input',
        AddOn.Icon = 'support_agent'
        AddOns.push(AddOn)
      // }
    }

    if (Plan==InsuranceCompanyName.ICICI) {
      if (Name==PlanNameEnum.icici_HAE_ApexPlus) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'Claim Protector',
        AddOn.Value = 'AddOn13',
        AddOn.Description = 'Applicable to All members that are Insured'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
          AddOn.InputType = '',

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'PA',
        AddOn.Value = 'AddOn8',
        AddOn.Description = 'Below are mandatory fields: <br> Proposer Annual Income.<br> Occupation (for children to update as Student/Child)'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
          AddOn.InputType = '',

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'Maternity',
        AddOn.Value = 'AddOn3',
        AddOn.Description = 'Applicable in below criteria:<br>Available for 2A (Self or Spouse relationship mandatory) .<br>Mandatory to add New Born and Vaccination with Maternity cover.'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
        AddOn.Dependable = false
        AddOn.InputType = '',

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'New Born',
        AddOn.Value = 'AddOn4',
        AddOn.Description = 'Applicable only if maternity cover is opted'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
          AddOn.InputType = '',

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'Vaccination',
        AddOn.Value = 'AddOn5',
        AddOn.Description = 'Applicable only if maternity cover is opted'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
          AddOn.InputType = '',

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'Critical Illness',
        AddOn.Value = 'AddOn2',
        AddOn.Description = 'Below are mandatory fields:<br>Proposer Annual Income .<br>Initial Waiting Period- 60/90 days .<br>Survival Period- 0 days (default)'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
        AddOn.InputType = 'input',


        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_HAE_ApexPlus,
        AddOn.AddOn = 'SI Protector',
        AddOn.Value = 'AddOn12',
        AddOn.Description = 'Optional'
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_AddOn85,
        AddOn.AddOn = 'Compassionate Visit',
        AddOn.Value = 'AddOn85',
        AddOn.Description = ''
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_AddOn86,
        AddOn.AddOn = 'Nursing at Home',
        AddOn.Value = 'AddOn86',
        AddOn.Description = ''
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_AddOn89,
        AddOn.AddOn = 'BeFit C',
        AddOn.Value = 'AddOn89',
        AddOn.Description = ''
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,
        AddOns.push(AddOn)

        
      }

      if (Name==PlanNameEnum.icici_GS_Plus) {
        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_GS_Plus,
        AddOn.AddOn = 'Claim Protector',
        AddOn.Value = 'AddOn1',
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_GS_Plus,
        AddOn.AddOn = 'Voluntary Deductible',
        AddOn.Value = 'AddOn3',
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_GS_Plus,
        AddOn.AddOn = 'Modification of base co-payment',
        AddOn.Value = 'AddOn2',
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,

        AddOns.push(AddOn)

        AddOn = new AddOnsDto()
        AddOn.Plan = PlanNameEnum.icici_GS_Plus,
        AddOn.AddOn = 'Care Management Plus Program',
        AddOn.Value = 'AddOn5',
        AddOn.Function = 'ICICI',
        AddOn.Answer = false,

        AddOns.push(AddOn)
      }

    }

    if (Plan==InsuranceCompanyName.BajajAllianz) {
      AddOn = new AddOnsDto()
      AddOn.Plan = Name,
      AddOn.AddOn = 'Room Rent Capping',
      AddOn.Value = 'Polcov46',
      AddOn.Description = ''
      AddOn.Function = 'Bajaj',
      AddOn.Answer = false,

      AddOns.push(AddOn)

      AddOn = new AddOnsDto()
      AddOn.Plan = Name,
      AddOn.AddOn = 'Non Medical Expense',
      AddOn.Value = 'Addonnme',
      AddOn.Description = ''
      AddOn.Function = 'Bajaj',
      AddOn.Answer = false,

      AddOns.push(AddOn)


      /**
       * Remove by Melvin Sir On 10-04-2024
       */

      // AddOn = new AddOnsDto()
      // AddOn.Plan = Name,
      // AddOn.AddOn = 'Policy Cover voluntary',
      // AddOn.Value = 'Polcovvolntrycp',
      // AddOn.Description = 'Policy Cover voluntary co-payment here, if any (5,10,15,20) in persentage (%)'
      // AddOn.Function = 'Bajaj',
      // AddOn.Answer = false,
      // AddOn.Dropdown = true,
      // AddOn.OptionArray = [{'name':'5 %' , 'value':'5'} , {'name':'10 %' , 'value':'10'} , {'name':'15 %' , 'value':'15'} , {'name':'20 %' , 'value':'20'}]
      // AddOn.DropdownName = 'CoPay'

      // AddOns.push(AddOn)
    }

    if (Plan==InsuranceCompanyName.GoDigit) {
      AddOn = new AddOnsDto()
      AddOn.Plan = Name,
      AddOn.AddOn = 'Consumables Cover',
      AddOn.Value = 'RHPNE',
      AddOn.Description = '10 % is the only value allowed if opting for this cover'
      AddOn.Function = 'GoDigit',
      AddOn.Answer = false,

      AddOns.push(AddOn)

      AddOn = new AddOnsDto()
      AddOn.Plan = Name,
      AddOn.AddOn = 'Pre Existing Disease Waiting Period',
      AddOn.Value = 'RHPDW',
      AddOn.Description = ''
      AddOn.Function = 'GoDigit',
      AddOn.Answer = false,
      AddOn.Dropdown = true,
      AddOn.OptionArray = [ {'name':'2 Year' , 'value':2}]
      // AddOn.OptionArray = [{'name':'3 Year' , 'value':3} , {'name':'2 Year' , 'value':2} , {'name':'1 Year' , 'value':1}]
      AddOn.DropdownName = 'RHPDWValue',
      AddOn.Icon = 'perm_contact_calendar'

      AddOns.push(AddOn)

      // AddOn = new AddOnsDto()
      // AddOn.Plan = Name,
      // AddOn.AddOn = 'Network Hospital Discount',
      // AddOn.Value = 'RHNHC',
      // AddOn.Description = ''
      // AddOn.Function = 'GoDigit',
      // AddOn.Answer = false,

      // AddOns.push(AddOn)

      // AddOn = new AddOnsDto()
      // AddOn.Plan = Name,
      // AddOn.AddOn = 'Initial Waiting Period Modification',
      // AddOn.Value = 'RHIWP',
      // AddOn.Description = '7 to 30 Days'
      // AddOn.Function = 'GoDigit',
      // AddOn.Answer = false,
      // AddOn.Dropdown = true,
      // AddOn.DropdownName = 'RHIWPValue',

      // AddOns.push(AddOn)
    }

    if (Plan==InsuranceCompanyName.HdfcErgo) {
      AddOn = new AddOnsDto()
      AddOn.Plan = Name,
      AddOn.AddOn = 'Aggregate Deductible',
      AddOn.Value = 'deductibleBoolean',
      AddOn.Description = 'Select Aggregate Deductible Amount <br><br><br><p class="text-gray-500"><span class="font-bold">Note:</span> Get a discount on your insurance premium when you agree to pay certain aggregate deductible amount</p>'
      AddOn.Function = 'Hdfc',
      AddOn.Answer = false,
      AddOn.Dropdown = true,
      AddOn.OptionArray = [ {'name':'0' , 'value':0},{'name':'25,000' , 'value':25000},{'name':'50,000' , 'value':50000},{'name':'1,00,000' , 'value':100000}]
      AddOn.DropdownName = 'Deductible',
      AddOn.Icon = '₹'

      AddOns.push(AddOn)
    }
    return AddOns

  }


  GetCareMandatoryAddOns(Productcode: string, PinCode: string, EldestMemberDOB:string){
    let apiEndpoint = API_ENDPOINTS.Care.MandatoryAddOns + `?Productcode=${Productcode}&PinCode=${PinCode}&EldestMemberDOB=${EldestMemberDOB}`;
    return this._http.get<any>(apiEndpoint,httpOptions)
  }

  GetMandatoryAddOns(SubProductCode: string, PinCode: string){
    let apiEndpoint = API_ENDPOINTS.ICICI.MandatoryAddOns + `?Productcode=${SubProductCode}&PinCode=${PinCode}`;
    return this._http.get<any>(apiEndpoint,httpOptions)
  }
}
