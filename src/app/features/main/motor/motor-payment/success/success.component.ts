import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { HDFCDownloadPolicy, IHDFCDownloadPolicy } from '@models/dtos/motor-insurance/hdfc-motor';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { MotorQuoteService } from '../../motor-quote.service';
import { ZunoDownloadPolicy } from '@models/dtos/motor-insurance/ZunoMotor';
import { TataAIADownloadPolicy } from '@models/dtos/motor-insurance/TataAIA/TataAIAMotorPolicydto';
import { BAJAJDownloadPolicy } from '@models/dtos/motor-insurance/bajaj';
import { GoDigitDownloadPolicy } from '@models/dtos/motor-insurance/go-digit/go-digit-download-policy';

@Component({
  selector: 'gnx-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent {

  Insurer: string;
  PolicyNo: string;
  Productcode: string;
  TransactionNo: string;

  HDFCDownload: IHDFCDownloadPolicy

  //#region constructor
  constructor(private _router: Router,
    private route: ActivatedRoute,
    private _quoteService: MotorQuoteService,
    private _CommonFuncService: CommonFunctionsService) {
    let data = this.route.snapshot.queryParams;
    this.Insurer = data['Insurer'];
    this.PolicyNo = data['PolicyNo'];
    this.Productcode = data['Productcode'];
    this.TransactionNo = data['TransactionNo'];

    if (this.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo) {
      this.HDFCPolicyDownload();
    }
    if (this.Insurer.toLowerCase() == InsuranceCompanyName.Zuno) {
      this.ZunoPolicyDownload();
    }
    if (this.Insurer.toLowerCase() == InsuranceCompanyName.TataAIA) {
      this.TataAIAPolicyDownload();
    }
    if (this.Insurer.toLowerCase() == InsuranceCompanyName.BajajAllianz) {
      this.BAJAJPolicyDownload();
    }
    if (this.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
      this.GoDigitPolicyDownload();
    }

  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // redirect to Health form
  public backToMotorPolicyList() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Car]);
  }

  // Hdfc policy download method
  public HDFCPolicyDownload() {
    this.HDFCDownload = new HDFCDownloadPolicy()
    this.HDFCDownload.PolicyNo = this.PolicyNo
    this.HDFCDownload.Productcode = this.Productcode
    this.HDFCDownload.TransactionNo = this.TransactionNo

    this._quoteService.HDFCDownloadPolicy(this.HDFCDownload).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res)
      this.backToMotorPolicyList();
    })

  }

  // Zuno policy download method
  public ZunoPolicyDownload() {

    let ZunoDownload = new ZunoDownloadPolicy()
    ZunoDownload.Insurer = this.Insurer
    ZunoDownload.PolicyNo = this.PolicyNo

    this._quoteService.ZunoDownloadjson(ZunoDownload).subscribe((jsonRes) => {
      if (jsonRes.Success) {
        this._quoteService.ZunoDownloadPolicy(ZunoDownload).subscribe((response) => {
          this._CommonFuncService.DownloadPolicy(response)
          this.backToMotorPolicyList();
        })
      }
    })

  }

  // TataAIA policy download method
  public TataAIAPolicyDownload() {

    let PolicyDownload = new TataAIADownloadPolicy()
    PolicyDownload.Insurer = this.Insurer
    PolicyDownload.PolicyNo = this.PolicyNo

    this._quoteService.TATAAIADownloadjson(PolicyDownload).subscribe((jsonRes) => {
      if (jsonRes.Success) {
        this._quoteService.TATAAIADownloadPolicy(PolicyDownload).subscribe((response) => {
          this._CommonFuncService.DownloadPolicy(response)
          this.backToMotorPolicyList();
        })
      }
    })

  }

  // BAJAJ policy download method
  public BAJAJPolicyDownload() {

    let BAJAJDownload = new BAJAJDownloadPolicy()
    BAJAJDownload.Insurer = this.Insurer
    BAJAJDownload.PolicyNo = this.PolicyNo

    this._quoteService.BAJAJPolicyJson(BAJAJDownload).subscribe((jsonRes) => {
      if (jsonRes.Success) {
        this._quoteService.BAJAJDownloadPolicy(BAJAJDownload).subscribe((response) => {
          this._CommonFuncService.DownloadPolicy(response)
          this.backToMotorPolicyList();
        })
      }
    })

  }

  // GO Digit policy download method
  public GoDigitPolicyDownload() {

    let GoDigitDownload = new GoDigitDownloadPolicy()
    GoDigitDownload.Insurer = this.Insurer
    GoDigitDownload.PolicyNo = this.PolicyNo

    this._quoteService.GoDigitPolicyJson(GoDigitDownload).subscribe((jsonRes) => {
      if (jsonRes.Success) {
        this._quoteService.GoDigitDownloadPolicy(GoDigitDownload).subscribe((response) => {
          this._CommonFuncService.DownloadPolicy(response)
          this.backToMotorPolicyList();
        })
      }
    })

  }


  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------


  // #endregion Private methods
}
