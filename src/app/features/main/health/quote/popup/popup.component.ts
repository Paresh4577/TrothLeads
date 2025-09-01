import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPolicy } from '@models/transactions/policy.dto';

@Component({
  selector: 'gnx-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent {
  title: string;
  ispopup: boolean = false;
  Policy: IPolicy;

  //   // #end region public variables

  //   /**
  //    * #region constructor
  //    * @param _route : used for getting dynamic route or id
  //    */

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      Policies: IPolicy;
      title: string;
      isMultiple: boolean;
      data?: any;
    }
  ) {
    this.title = data.title;
    this.Policy = data.Policies;
  }

  // #endregion constructor

  ngOnInit(): void {

  }

  // #region public methods

  // close PopUp
  public cancle() {
    this.dialogRef.close();
  }

  // #endregion public methods

  // #region private methods

  // #endregion private methods
}
