import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';

@Component({
  selector: 'gnx-hdfc-cis-document-popup',
  templateUrl: './hdfc-cis-document-popup.component.html',
  styleUrls: ['./hdfc-cis-document-popup.component.scss']
})
export class HDFCCISDocumentPopupComponent {

  // #region public variables

  // Strings
  title: string = '';
  private _proposaldata: any;
  private _api: string
  public cISDocumentPath: string = '';

  //Formgroup
  CISDocumentForm: FormGroup;


  // #endregion public variables

  /**
   * #region constructor
   * @param _location : used for back or prev page navigation
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */
  constructor(
    private _fb: FormBuilder,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    public dialogRef: MatDialogRef<HDFCCISDocumentPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      CISDocumentPath: string,
      Insurer: number,
      TransactionNo: string,
      Productcode: string,
      ProposalNo: string,
      Category: string,
    }
  ) {

    this.title = this.data.title

    this._proposaldata = this.data;
  }
  // #endregion constructor

  ngOnInit(): void {

    this.CISDocumentForm = this._buildHDFCForm();
    this.getCISDocument();

  }


  /**
 * #region public methods
 */

  public PayNow() {
    this.dialogRef.close(true);
  }

  // #endregion public methods

  /**
 * #region private methods
 */

  // get HDFC CIS Document 
  private getCISDocument() {

    if (this._proposaldata.Category == "TwoWheeler" || this._proposaldata.Category == "PrivateCar") {
      this._api = API_ENDPOINTS.HDFCMotor.HDFCCISDocument
    }
    else if (this._proposaldata.Category == "Health") {
      this._api = API_ENDPOINTS.HDFC.HDFCCISDocument
    }

    this._dataService.getData(this.CISDocumentForm.value, this._api + '/true')
      .subscribe((res) => {
        if (res.Success) {
          this.cISDocumentPath = res.Data.ProposalDownloadLink;
        } else {
          this._alertservice.raiseErrors(res.Alerts);
          // // handle page/form level alerts here
          // if (res.Alerts[0]) {
          //   this.errors = res.Alerts[0].Message
          // }
        }
      });
  }

  // #endregion private methods

  private _buildHDFCForm() {
    let _HDFCForm = this._fb.group({
      Insurer: [this._proposaldata.Insurer],
      TransactionNo: [this._proposaldata.TransactionNo],
      Productcode: [this._proposaldata.Productcode],
      ProposalNo: [this._proposaldata.ProposalNo],
      ConfirmCISDocument: [false],
    });

    return _HDFCForm;
  }

}
