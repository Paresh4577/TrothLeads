import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteService } from '../../quote/quote.service';
import { IIffcoTokioDownloadPolicyDto, IffcoTokioDownloadPolicyDto } from '@models/dtos/config/IffcoTokio/iffco-tokio-download-policy-dto';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { GoDigitDownloadPolicyDto, IGoDigitDownloadPolicyDto } from '@models/dtos/config/GoDigit';
import { HDFCDownloadPolicyDto, IHDFCDownloadPolicyDto } from '@models/dtos/config/Hdfc';

@Component({
  selector: 'gnx-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent {
  PolicyNo: string;
  PolicyType: string
  CorrelationId: string;
  CustomerId: string;
  Insurer: string;
  Productcode: string;
  TransactionNo: string;
  GoDigitDownload: IGoDigitDownloadPolicyDto
  HDFCDownload: IHDFCDownloadPolicyDto
  IffcoTokio : IIffcoTokioDownloadPolicyDto

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _QuoteService: QuoteService,
    private _CommonFuncService: CommonFunctionsService
  ) {
    let data = this.route.snapshot.queryParams;
    this.PolicyNo = data['PolicyNo'];
    this.Insurer = data['Insurer'];
    this.CorrelationId = data['CorrelationId'];
    this.CustomerId = data['CustomerId'];
    this.Productcode = data['Productcode'];
    this.TransactionNo = data['TransactionNo'];
    this.PolicyType = data['PolicyType'];

    
    if (this.Insurer.toLowerCase() == InsuranceCompanyName.Care) {
      this.CarePolicyDownload();
    } else if (this.Insurer.toLowerCase() == InsuranceCompanyName.ICICI) {
      this.ICICIPolicyDownload();
    } else if (this.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
      this.GoDigitPolicyDownload();
    } else if (this.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo) {
      this.HDFCPolicyDownload();
    } else if (this.Insurer.toLowerCase() == InsuranceCompanyName.AdityaBirla) {
      this.AdityaPolicyDownload();
    } else if (this.Insurer.toLowerCase() == InsuranceCompanyName.IffcoTokio) {
      this.IffcoTokioPolicyDownload();
    } else {
      this.download();
    }

  }

  // redirect to Health form
  public backToHealth() {
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan]);
    }
  }

  // ICICI policy download method
  public ICICIPolicyDownload() {
    this._QuoteService.DownloadPolicy(this.PolicyNo, this.CorrelationId, this.CustomerId).subscribe((res) => {
        this._CommonFuncService.DownloadPolicy(res)
        this.backToHealth();
    });
  }

  // Care policy download method
  public CarePolicyDownload() {
    this._QuoteService.CareDownloadPolicy(this.PolicyNo).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res)
      this.backToHealth();
    })

  }

  // goDigit Policy Download method
  public GoDigitPolicyDownload() {
    this.GoDigitDownload = new GoDigitDownloadPolicyDto();
    this.GoDigitDownload.PolicyNo = this.PolicyNo
    this._QuoteService.GoDigitDownloadPolicy(this.GoDigitDownload).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res)
      this.backToHealth();
    })
  }

  // Hdfc policy download method
  public HDFCPolicyDownload() {
    this.HDFCDownload = new HDFCDownloadPolicyDto()
    this.HDFCDownload.PolicyNo = this.PolicyNo
    this.HDFCDownload.Productcode = this.Productcode
    this.HDFCDownload.TransactionNo = this.TransactionNo
    this._QuoteService.HDFCDownloadPolicy(this.HDFCDownload).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res)
      this.backToHealth();
    })

  }

  // Iffco Tokio Policy Download method
  public IffcoTokioPolicyDownload() {
    this.IffcoTokio = new IffcoTokioDownloadPolicyDto()
    // this.IffcoTokio.Insurer = this.Insurer
    this.IffcoTokio.PolicyNo = this.PolicyNo
    this.IffcoTokio.PolicyType = this.PolicyType
    this._QuoteService.IFFCOTOKIODownloadPolicy(this.IffcoTokio).subscribe((res) => {
      
      if (res.Success) {
        window.open(res.Data.PolicyDownloadLink,'_blank')
      }
      
      this.backToHealth();
    })
  }

  // Aditya Policy Download method
  public AdityaPolicyDownload() {
    if (this.PolicyNo) {
      this._QuoteService.AdityaBirlaDownloadPolicy(this.PolicyNo).subscribe((res) => {
        this._CommonFuncService.DownloadPolicy(res)
        this.backToHealth();
      })
    } else {
      this.backToHealth();
    }

  }

  public download() {

  }
}