import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'gnx-add-on-details-pop-up',
  templateUrl: './add-on-details-pop-up.component.html',
  styleUrls: ['./add-on-details-pop-up.component.scss']
})
export class AddOnDetailsPopUpComponent {

  title:string
  AddOnDetails
  BasePremium:number
  TotalPremium:number

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      data?: any;
      base: number;
      total: number;
    }
  ) {
    this.title = data.title;
    this.AddOnDetails = data.data;
    this.BasePremium = data.base;
    this.TotalPremium = data.total;
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
}
