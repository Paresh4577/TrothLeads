import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'gnx-endorsement-confirm-dialog',
  templateUrl: './endorsement-confirm-dialog.component.html',
  styleUrls: ['./endorsement-confirm-dialog.component.scss']
})
export class EndorsementConfirmDialogComponent {
  //   // #start region public variables
  pagetitle: string;

  //   // #end region public variables

  //   /**
  //    * #region constructor
  //    */

  constructor(
    public dialogRef: MatDialogRef<EndorsementConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      data?: any;
    }
  ) {
    this.pagetitle = this.data.title;
  }

  // #endregion constructor

  ngOnInit(): void {

  }

  // #region public methods
 public close() {
    this.dialogRef.close()
  }
 
  public selectPolicyType(type) {
    this.dialogRef.close(type)
  }



  // #endregion public methods

}
