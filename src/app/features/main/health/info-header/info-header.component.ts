import { Component, Input } from '@angular/core';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';

@Component({
  selector: 'gnx-info-header',
  templateUrl: './info-header.component.html',
  styleUrls: ['./info-header.component.scss']
})
export class InfoHeaderComponent {

  @Input()
  Icon: string;

  @Input()
  LSInsurer : string;

  @Input()
  InsuredPeople: number;

  @Input()
  member: any[];
  
  @Input()
  ReqSumInsured: number;
  
  @Input()
  PolicyType: string;
  
  @Input()
  PolicyPeriod: number;

  @Input()
  TotalPremium : number


  InsuranceCompany = InsuranceCompanyName;

  constructor(

  ) {    
    // if (localStorage.getItem('member')) {
    //   this.member = JSON.parse(localStorage.getItem('member'));
    //   this.InsuredPeople = this.member.length;
    // }
  }


}